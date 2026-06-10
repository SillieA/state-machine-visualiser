import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  output: "export",
  // Set BASE_PATH env var in CI/deployment to enable the GitHub Pages subpath.
  // Locally, leave it unset and serve out/ directly.
  basePath: process.env.BASE_PATH ?? "",
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  /* Future: when adding server-side features (e.g., GitHub API integration),
     remove 'output: export' and 'basePath', then use dynamic routes/API handlers instead */
};

export default nextConfig;

