import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["172.16.110.6"],
    },
  },
};

export default nextConfig;
