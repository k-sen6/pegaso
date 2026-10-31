import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Export estático para GitHub Pages
  output: "export",
  // GitHub Pages sirve el sitio bajo /pegaso (repo k-sen6/pegaso)
  basePath: "/pegaso",
  assetPrefix: isProd ? "/pegaso" : undefined,
  trailingSlash: true,
};

export default nextConfig;
