/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gisservices.mainroads.wa.gov.au',
      },
    ],
  },
};

export default nextConfig;
