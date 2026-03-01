import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // ตั้งเป็น true เพื่อให้จำการ redirect
      },
    ]
  },
};

export default nextConfig;