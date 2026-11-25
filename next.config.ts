import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Frame photos are optimised from /media (public photos only: the optimiser
    // asks without a login). Kept for an hour at most, so a photo removed or a
    // frame hidden stops showing soon (the optimiser cache can't be cleared).
    // While developing, also the DUMMY C12 hero photos in public/dummy (never in production).
    localPatterns: [
      { pathname: "/media/**", search: "" },
      ...(process.env.NODE_ENV === "production" ? [] : [{ pathname: "/dummy/**", search: "" }]),
    ],
    minimumCacheTTL: 3600,
  },
  experimental: {
    // Photo uploads go through server actions. Room for one 10 MB photo plus
    // form overhead, so src/lib/upload-rules.ts gives the "too large" message
    // instead of Next.js refusing the request (default limit: 1 MB).
    serverActions: { bodySizeLimit: "12mb" },
    proxyClientMaxBodySize: "12mb", // /admin requests pass through src/proxy.ts
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
