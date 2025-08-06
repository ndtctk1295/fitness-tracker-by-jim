/** @type {import('next').NextConfig} */
const headers = [
  "Accept", "Accept-Version", "Content-Length",
  "Content-MD5", "Content-Type", "Date", "X-Api-Version",
  "X-CSRF-Token", "X-Requested-With",
];

const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Critical: Better handling of external packages in standalone mode
  serverExternalPackages: ['mongoose', 'bcrypt'],
  
  // Experimental features for better SSR handling
  experimental: {
    // Improve hydration in production
    optimizePackageImports: ['@tanstack/react-query', 'zustand'],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Webpack configuration for better bundle handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure proper client-side hydration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/api/health/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {  key: 'Access-Control-Allow-Origin', value: `${process.env.NEXTAUTH_URL}` },
          { key: "Access-Control-Allow-Methods", value: "GET,POST" },
          { key: "Access-Control-Allow-Headers", value: headers.join(", ") }
          ]
      }
    ];
  },
}

export default nextConfig
