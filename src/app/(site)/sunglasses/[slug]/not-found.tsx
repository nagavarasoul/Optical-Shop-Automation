import { NotFoundPage } from "@/components/site/not-found-page";

/* A frame that doesn't exist, isn't approved or is under the wrong page.
   Spec: Requirements_NotFound.md (smart hint) and Requirements_Frames.md */
export default function NotFound() {
  return <NotFoundPage variant="sunglasses" />;
}
