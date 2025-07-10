/** @type {import('next').NextConfig} */
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
  
  // Production optimizations for database operations
  serverExternalPackages: ['mongoose', 'bcrypt'],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
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
    ];
  },
}

export default nextConfig
