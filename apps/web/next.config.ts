import "@aethon/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["shiki", "@aethon/roadmap-engine", "@codesandbox/sandpack-react", "@codesandbox/sandpack-client"],
};

export default nextConfig;
