import type { NextConfig } from 'next';
import withPWAInit from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: 'public',
  disable: !isProd,
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
