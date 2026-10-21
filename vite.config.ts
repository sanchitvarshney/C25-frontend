import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
//@ts-ignore
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
   
    dedupe: ["@emotion/react", "@emotion/styled", "react", "react-dom"],
  },
 optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/material/styles",
      "@mui/system",
      "@mui/styled-engine",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@emotion/react",
      "@emotion/styled",
      "@emotion/cache", // add — internal dep, often the one triggering re-discovery
      "@emotion/serialize", // add — same reason
    ],
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
          antd: ["antd"],
          "mui-vendor": [
            "@mui/material",
            "@mui/material/styles",
            "@emotion/react",
            "@emotion/styled",
          ],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
