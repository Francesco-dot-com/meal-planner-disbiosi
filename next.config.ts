import withPWA from "next-pwa";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {};

export default withPWA({
  ...nextConfig,
  dest: "public",
  disable: !isProd
});
