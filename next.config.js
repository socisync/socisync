/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile react-pdf packages for proper bundling
  transpilePackages: ['@react-pdf/renderer', '@react-pdf/layout', '@react-pdf/pdfkit'],
  
  // Webpack config for react-pdf compatibility
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
}

module.exports = nextConfig
