/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rozgarlink/ui', '@rozgarlink/shared-types', '@rozgarlink/explainer'],
  reactStrictMode: true
};

export default nextConfig;
