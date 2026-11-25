/* Photo upload rules (Requirements_Admin.md section 6.2), kept free of
   server-only imports so scripts and tests can check them directly.
   The browser resizes photos to 1600 px and converts them (WebP or JPEG)
   before upload; these checks run again on the server, because anything the
   browser sends can be faked. */

export const BUCKETS = ["frames", "lenses", "camps", "gallery"] as const;
export type Bucket = (typeof BUCKETS)[number];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export type ImageType = { ext: "jpg" | "png" | "webp"; mime: string };

export const UPLOAD_ERRORS = {
  empty: "This photo is empty. Take or choose it again.",
  too_large: "This photo is too large (max 10 MB).",
  not_photo: "This file isn't a photo. Use JPG, PNG or WebP.",
} as const;
export type UploadErrorCode = keyof typeof UPLOAD_ERRORS;

/** The real file type, read from the first bytes. The name and the type the browser claims are ignored. */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  const at = (offset: number, ...sig: number[]) => sig.every((b, i) => bytes[offset + i] === b);
  if (bytes.length >= 3 && at(0, 0xff, 0xd8, 0xff)) return { ext: "jpg", mime: "image/jpeg" };
  if (bytes.length >= 8 && at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { ext: "png", mime: "image/png" };
  // RIFF....WEBP
  if (bytes.length >= 12 && at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return { ext: "webp", mime: "image/webp" };
  return null;
}

/** Checks an upload's size and real type. Returns the type, or the reason it's refused. */
export function checkUpload(bytes: Uint8Array): { ok: true; type: ImageType } | { ok: false; code: UploadErrorCode } {
  if (bytes.length === 0) return { ok: false, code: "empty" };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, code: "too_large" };
  const type = detectImageType(bytes);
  return type ? { ok: true, type } : { ok: false, code: "not_photo" };
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const STORED_PATH = new RegExp(`^(${BUCKETS.join("|")})/(${UUID})/(${UUID})\\.(jpg|png|webp)$`);

export const isUuid = (s: string) => new RegExp(`^${UUID}$`).test(s);

/**
 * A stored photo path looks exactly like "frames/<frame id>/<random id>.webp".
 * Anything else (../, backslashes, other folders or extensions) is refused,
 * so a request can never reach a file outside the uploads folder.
 */
export function parseStoredPath(p: string): { bucket: Bucket; ext: ImageType["ext"] } | null {
  const m = STORED_PATH.exec(p);
  return m ? { bucket: m[1] as Bucket, ext: m[4] as ImageType["ext"] } : null;
}

export const MIME_BY_EXT: Record<ImageType["ext"], string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
