import Image from "next/image";
import { Icon } from "@/components/site/icons";

/* A frame photo from /media, or the frame drawing while there's no photo. */
export function FramePhoto({ path, alt, sizes, priority = false }: { path: string | null; alt: string; sizes: string; priority?: boolean }) {
  if (!path) return <Icon name="glasses" />;
  return <Image className="fphoto" src={`/media/${path}`} alt={alt} fill sizes={sizes} priority={priority} />;
}
