import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Note: instrumentation.ts is enabled by default in Next.js 15+

  // Exclude New Relic from client-side bundle (server-side only)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Completely exclude New Relic from client bundle
      config.externals = config.externals || [];
      config.externals.push('newrelic');

      config.resolve.alias = {
        ...config.resolve.alias,
        'newrelic': false,
      };
    } else {
      // For server, mark as external to avoid bundling
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('newrelic');
      }
    }
    return config;
  },
};

export default nextConfig;
