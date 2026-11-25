import { DUMMY, type DummyId } from "@/lib/site-config";

/* Marks a placeholder value (docs/dummy-data.md) while developing, like the
   mockups' review notes. Never rendered in a production build; there,
   `npm run check:launch` is what stops dummy values going live. */
export function DummyTag({ id }: { id: DummyId }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className="dummy-tag" title={DUMMY[id]}>
      DUMMY {id}
    </span>
  );
}
