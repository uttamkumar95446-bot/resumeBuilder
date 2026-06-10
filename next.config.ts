import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent playwright-core from being bundled into the client bundle
  // since it's only used server-side for PDF generation
  serverExternalPackages: ['playwright-core'],
};

export default nextConfig;
