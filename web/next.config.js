/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "production" ? "../app" : "./.next",
  output: process.env.FOR_ELECTRON === "true" ? "export" : "standalone", // Use standalone output for a server-based Next.js app
  images: {
    unoptimized: process.env.FOR_ELECTRON === "true" ? true : undefined,
  },
};
module.exports = nextConfig;
