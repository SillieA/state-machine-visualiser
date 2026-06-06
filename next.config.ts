import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/state-machine-visualiser",
  /* Future: when adding server-side features (e.g., GitHub API integration),
     remove 'output: export' and 'basePath', then use dynamic routes/API handlers instead */
};

export default nextConfig;

