import "@aethon/env/docs";
import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ["192.168.1.40"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
