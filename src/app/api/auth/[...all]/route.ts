import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/* Better Auth's endpoints (sign in, sign out, session). Sign-up is switched off
   in src/lib/auth-options.ts; admin-only endpoints check the admin role. */
export const { GET, POST } = toNextJsHandler(auth);
