import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Staff } from "./session";
import { checkUpload, isUuid, MAX_UPLOAD_BYTES, parseStoredPath, UPLOAD_ERRORS, type Bucket, type UploadErrorCode } from "./upload-rules";

/* Photo storage: the local uploads/ folder (gitignored), only through this file,
   so it can move to cloud storage later without touching pages.
   Saving needs a signed-in staff member: pass the result of requireStaff().
   Visitors get photos through /media/…, which checks visibility first. */

const ROOT = path.join(process.cwd(), "uploads");

export class UploadError extends Error {
  code: UploadErrorCode;
  constructor(code: UploadErrorCode) {
    super(UPLOAD_ERRORS[code]); // plain words for the form, e.g. "This photo is too large (max 10 MB)."
    this.code = code;
  }
}

/**
 * Saves one photo for `ownerId` (the frame, lens, camp or gallery photo id) and
 * returns its stored path, e.g. "frames/<frame id>/<random id>.webp".
 * The file's real type and size are checked here, whatever the browser claimed.
 */
export async function saveUpload(staff: Staff, bucket: Bucket, ownerId: string, file: Blob): Promise<string> {
  if (!staff?.id) throw new Error("saveUpload needs a signed-in staff member");
  if (!isUuid(ownerId)) throw new Error("saveUpload: ownerId must be a UUID");
  // Refuse obviously large files before reading them into memory
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("too_large");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = checkUpload(bytes);
  if (!result.ok) throw new UploadError(result.code);

  const stored = `${bucket}/${ownerId}/${randomUUID()}.${result.type.ext}`;
  const target = path.join(ROOT, ...stored.split("/"));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes, { flag: "wx" }); // never overwrite
  return stored;
}

/** Reads a stored photo, or null if the path isn't valid or the file is missing. */
export async function readUpload(stored: string): Promise<{ bytes: Buffer; ext: "jpg" | "png" | "webp" } | null> {
  const parsed = parseStoredPath(stored);
  if (!parsed) return null;
  try {
    return { bytes: await readFile(path.join(ROOT, ...stored.split("/"))), ext: parsed.ext };
  } catch {
    return null;
  }
}

/** Deletes a stored photo (after its database row is removed). Missing files are ignored. */
export async function deleteUpload(staff: Staff, stored: string): Promise<void> {
  if (!staff?.id) throw new Error("deleteUpload needs a signed-in staff member");
  if (!parseStoredPath(stored)) return;
  await unlink(path.join(ROOT, ...stored.split("/"))).catch(() => {});
}
