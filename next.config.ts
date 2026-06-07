import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Set BASE_PATH env var in CI/deployment to enable the GitHub Pages subpath.
  // Locally, leave it unset and serve out/ directly.
  basePath: process.env.BASE_PATH ?? "",
  /* Future: when adding server-side features (e.g., GitHub API integration),
     remove 'output: export' and 'basePath', then use dynamic routes/API handlers instead */
};

export default nextConfig;

