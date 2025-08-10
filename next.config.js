/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export so SSR and API routes work
  // output: 'export', 

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },

  webpack: (config) => {
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push({ module: /@supabase\/realtime-js/ });
    return config;
  },
};

module.exports = nextConfig;
