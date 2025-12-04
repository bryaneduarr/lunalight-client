import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure remote image patterns for theme previews.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
