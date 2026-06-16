import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Compile the workspace packages (shipped as TypeScript source) as part of the app.
  transpilePackages: ["@vaidiq/config", "@vaidiq/ui", "@vaidiq/db"],
  // Pin the workspace root so Turbopack doesn't mis-infer it from sibling lockfiles.
  turbopack: { root: path.resolve(__dirname, "..", "..") },
};

export default nextConfig;
