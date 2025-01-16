const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };
    config.externals.push({
      'https://deno.land/std@0.168.0/http/server.ts': 'commonjs https://deno.land/std@0.168.0/http/server.ts',
      'https://esm.sh/@supabase/supabase-js@2.39.3': 'commonjs https://esm.sh/@supabase/supabase-js@2.39.3'
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'fzvyldbiyhjrdhhjeues.supabase.co',
      },
    ],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  async redirects() {
    return [
      {
        source: '/product',
        destination: '/products',
        permanent: true,
      },
    ];
  },
  // 静的生成を無効化し、サーバーサイドレンダリングを使用
  output: 'standalone',
}

module.exports = nextConfig;
