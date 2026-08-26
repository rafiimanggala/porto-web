import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/shopify",
        destination: "/work/made-to-measure-shopify",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
