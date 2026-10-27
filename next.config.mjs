// MiniCssExtractPlugin can cause ESM/CJS interop issues in some environments.
// Temporarily disable the explicit import to avoid parse errors during build
// and use a conditional require inside the webpack function if needed.

const nextConfig = {
  // Build as a normal Next.js app (server or serverless) for Vercel/Render deployments.
  // Static export was previously enabled (`output: 'export'`) which prevents server
  // features (App Router server actions, API routes). We remove it so the app can
  // be deployed to a dynamic host.
  // trailingSlash: true, // enable if you need trailing slashes on routes
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      enabled: false,
    },
  },
  webpack(config, { isServer }) {
    // Ensure mini-css-extract-plugin is only added for client-side bundling
    if (!isServer) {
      try {
        // require dynamically to avoid ESM/CJS issues when importing at module scope
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const MiniCssExtractPlugin = require('mini-css-extract-plugin');
        config.plugins.push(new MiniCssExtractPlugin());
      } catch (e) {
        // If plugin isn't available or causes issues, skip adding it
        // This keeps builds working; add plugin via proper install/interop when ready.
      }
    }
    return config;
  },
};

export default nextConfig;

// "export": "next build && next export -o out"

