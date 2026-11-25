import { sql } from "drizzle-orm";
import { withRole } from "@/lib/db";
import { getStaff } from "@/lib/session";
import { readUpload } from "@/lib/storage";
import { MIME_BY_EXT, parseStoredPath } from "@/lib/upload-rules";

/* Serves uploaded photos: /media/frames/<frame id>/<photo id>.webp
   A photo is served only if its database row is visible to the person asking.
   The lookup runs with their role, so row-level security decides: the public
   sees photos of approved, visible content; signed-in staff also see drafts.
   Anything else, including made-up or ../ paths, is a plain 404. */

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(_request: Request, { params }: RouteContext<"/media/[...path]">) {
  const stored = (await params).path.join("/");
  if (!parseStoredPath(stored)) return notFound();

  const staff = await getStaff();
  const visible = await withRole(staff?.role ?? "public", async (tx) => {
    const r = await tx.execute<{ ok: boolean }>(sql`
      select exists (select 1 from frame_images where path = ${stored})
          or exists (select 1 from camp_photos where path = ${stored})
          or exists (select 1 from gallery_photos where path = ${stored})
          or exists (select 1 from lenses where photo_path = ${stored}) as ok`);
    return r.rows[0]?.ok === true;
  });
  if (!visible) return notFound();

  const file = await readUpload(stored);
  if (!file) return notFound();

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": MIME_BY_EXT[file.ext],
      "Content-Length": String(file.bytes.length),
      // Public photos can be cached; a draft seen by staff must not be
      "Cache-Control": staff ? "private, no-store" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
