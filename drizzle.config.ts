import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // db:generate works without a database; db:studio needs .env.local
}

/* Drizzle migrations for the app tables. Login tables are Better Auth's and
   security lives in db/security.sql, so both are left out here. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL_OWNER ?? "" },
  tablesFilter: ["!user", "!session", "!account", "!verification"],
  strict: true,
});
