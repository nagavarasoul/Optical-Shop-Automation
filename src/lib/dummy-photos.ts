import "server-only";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/* DUMMY photos (AI-generated people) in public/dummy, shown only while
   developing: never in a production build. The folder is gitignored and
   `npm run check:launch` fails while it holds images.
   - hero/: the homepage hero slideshow (C12)
   - naiv/: Men / Women / Kids frames and sunglasses, for the menus and the
     homepage categories (C24), named like "men-frames.png" */
const DIR = path.join(process.cwd(), "public", "dummy");
const on = process.env.NODE_ENV !== "production";
const IMAGE = /\.(jpe?g|png|webp)$/i;

/** Every photo in a dummy folder, by name, as public URLs. */
export function dummyPhotos(folder: string): string[] {
  if (!on) return [];
  try {
    return readdirSync(path.join(DIR, folder)).filter((f) => IMAGE.test(f)).sort().map((f) => `/dummy/${folder}/${f}`);
  } catch {
    return [];
  }
}

/** One dummy photo's URL, if the file is there; e.g. dummyPhoto("naiv", "men-frames"). */
export function dummyPhoto(folder: string, name: string): string | null {
  if (!on) return null;
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    if (existsSync(path.join(DIR, folder, `${name}.${ext}`))) return `/dummy/${folder}/${name}.${ext}`;
  }
  return null;
}

/** The C24 photo for a "Shop for" link: Men → men, Women → woman, Kids → kid. */
export function shopForPhoto(label: string, kind: "frames" | "sunglasses"): string | null {
  const who = ({ Men: "men", Women: "woman", Kids: "kid" } as Record<string, string>)[label];
  return who ? dummyPhoto("naiv", `${who}-${kind}`) : null;
}
