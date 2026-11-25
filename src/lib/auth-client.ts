import { createAuthClient } from "better-auth/react";

/* Browser side of the login form. Sign-in goes through /api/auth, so Better
   Auth's rate limit (5 attempts a minute) applies. It never touches the database. */
export const authClient = createAuthClient();
