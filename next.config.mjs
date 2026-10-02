// Static export: the build produces plain HTML/CSS/JS in the "out" folder,
// which can be hosted anywhere (GitHub Pages, Cloudflare Pages, Netlify...).
// NEXT_PUBLIC_BASE_PATH is set by the GitHub Actions workflow (e.g. "/taskboard").
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
