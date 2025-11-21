/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // لتجنب مشاكل الصور على Netlify
  },
  output: "standalone", // مهم إذا تت تريد تشغيله على Netlify Functions
};

module.exports = nextConfig;
