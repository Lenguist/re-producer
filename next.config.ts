import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" workspace root warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
