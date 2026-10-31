import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// NEXT_TARGET=apk: export sin basePath para servir dentro de la APK
const target = process.env.NEXT_TARGET;
const enApk = target === "apk";

const nextConfig: NextConfig = {
  // Export estático (GitHub Pages y APK local)
  output: "export",
  // GitHub Pages sirve bajo /pegaso; dentro de la APK la raíz
  basePath: enApk ? "" : "/pegaso",
  assetPrefix: isProd && !enApk ? "/pegaso" : undefined,
  trailingSlash: true,
};

export default nextConfig;
