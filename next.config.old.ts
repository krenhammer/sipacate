import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // // Cloudflare Pages with Next.js configuration
  // experimental: {
  //   optimizePackageImports: ['lucide-react'],
  // },
  // // Ensure compatibility with Cloudflare Pages
  // output: 'export',
  // // Disable image optimization since Cloudflare Pages will handle this
  // images: {
  //   unoptimized: true,
  // },
  // // Don't check the build output to allow Pages to handle it
  // distDir: '.next',
  // // Disable server components for Cloudflare Pages compatibility
  // reactStrictMode: true,
  // // Configure static export handling
  // trailingSlash: true,
  // // Set up the revalidate option to help with auth API routes
  // staticPageGenerationTimeout: 120,
}

export default nextConfig
