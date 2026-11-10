import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make sure the cached dataset ships with every server function on Vercel.
  outputFileTracingIncludes: {
    "/*": ["./data/launches.json"],
    "/api/**/*": ["./data/launches.json", "./assets/*.ttf"],
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
