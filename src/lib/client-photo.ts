/* Photos chosen in the staff area are resized in the browser before upload
   (Requirements_Admin.md 6.2): fast on mobile data, and the server checks the
   type and size again (upload-rules.ts). Shared by every staff photo form. */
import { MAX_UPLOAD_BYTES, UPLOAD_ERRORS } from "./upload-rules";

const LONG_EDGE = 1600;
export const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Resize to at most 1600 px on the long side and convert to WebP (JPEG where WebP isn't supported). */
export async function shrink(file: File): Promise<{ blob: Blob; note: string }> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(UPLOAD_ERRORS.too_large);
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file); } catch { throw new Error(UPLOAD_ERRORS.not_photo); } // e.g. HEIC outside Safari
  const scale = Math.min(1, LONG_EDGE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob) throw new Error(UPLOAD_ERRORS.not_photo);
  return { blob, note: `${kb(file.size)} → ${kb(blob.size)}` };
}

/** The upload file name for a resized photo. */
export const photoName = (blob: Blob, n: number) => `photo-${n}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
