import "@aethon/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["shiki", "@aethon/roadmap-engine"],
};

export default nextConfig;
