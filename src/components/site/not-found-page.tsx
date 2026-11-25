import { hoursLine } from "@/components/site/site-chrome";
import { NotFoundSearch, NotFoundView, type NotFoundVariant } from "@/components/site/not-found-view";
import { getBranches } from "@/lib/site-data";

/* A 404 page with the search form. The "Visit a branch" card names the
   branches and hours from the branches table (cached, tag "branches"). */
export async function NotFoundPage({ variant }: { variant: Exclude<NotFoundVariant, "error"> }) {
  const branches = await getBranches();
  const hours = hoursLine(branches);
  const visitText = [branches.map((b) => b.name).join(" and "), hours && hours.charAt(0).toLowerCase() + hours.slice(1)].filter(Boolean).join(", ");
  return <NotFoundView variant={variant} visitText={visitText} action={<NotFoundSearch />} />;
}
