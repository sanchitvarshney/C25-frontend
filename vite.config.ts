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
  },
  optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/material/styles",
      "@emotion/react",
      "@emotion/styled",
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
