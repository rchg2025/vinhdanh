import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Tăng giới hạn tải file lên 50MB
    },
  },
};

export default nextConfig;
