import { NotFoundPage } from "@/components/site/not-found-page";

/* A camp that doesn't exist or is hidden. Spec: Requirements_NotFound.md
   (smart hint) and Requirements_EyeCamps.md */
export default function NotFound() {
  return <NotFoundPage variant="camps" />;
}
