import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace packages (shipped as TypeScript source) as part of the app.
  transpilePackages: ["@vaidiq/config", "@vaidiq/ui", "@vaidiq/db"],
};

export default nextConfig;
