/* Loads .env.local for the database scripts (Next.js loads it for the app). */
export function loadEnv(): void {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // No .env.local yet: `npm run db:setup` creates it.
  }
}

export function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name} in .env.local. Run \`npm run db:setup\` first.`);
    process.exit(1);
  }
  return v;
}
