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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        'mongoose': 'commonjs mongoose',
        'bcrypt': 'commonjs bcrypt',
        'crypto': 'commonjs crypto',
      });
    }
    return config;
  },
    experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb', '@auth/mongodb-adapter'],
  },
  
  // Configure experimental features
  // experimental: {
  //   // Support for server actions
  //   serverActions: {
  //     bodySizeLimit: '2mb',
  //   },
  //   // Middleware configuration for MongoDB support
  //   middleware: {
  //     // This ensures middleware can use MongoDB
  //     // without Edge Runtime restrictions
  //     unstable_allowDynamicGlobs: [
  //       '/api/auth/**/*'
  //     ],
  //     unstable_skipMiddlewareUrlNormalize: true,
  //   },
  // },

  
  // Configure webpack to avoid bundling server-only modules in client-side code
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     // Don't attempt to import these packages on the client side
  //     config.resolve.alias = {
  //       ...config.resolve.alias,
  //       'mongodb': false,
  //       'mongoose': false,
  //       '@auth/mongodb-adapter': false,
  //       'bcrypt': false,
  //       'crypto': false
  //     }
  //   }
  //   return config;
  // },
  
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
