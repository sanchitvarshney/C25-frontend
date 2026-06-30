import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    sentryVitePlugin({
      org: "mscorpres-automation-pvt-ltd",
      project: "alwar",
      // Auth token from SENTRY_AUTH_TOKEN env var (set in CI/build environment)
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
    }),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/material/styles', '@emotion/react', '@emotion/styled'],
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    sourcemap: true, // required for Sentry source maps
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd'],
          'mui-vendor': ['@mui/material', '@mui/material/styles', '@emotion/react', '@emotion/styled'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
