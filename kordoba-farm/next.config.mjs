import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // GitHub-hosted images (e.g. ?raw=true links and raw.githubusercontent.com)
      { protocol: "https", hostname: "github.com", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
    ],
    // Skip image optimization in dev to avoid "received null" with some external URLs
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default withNextIntl(nextConfig);
