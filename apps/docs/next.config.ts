import "@aethon/env/docs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ["192.168.1.40"]
};

export default nextConfig;
