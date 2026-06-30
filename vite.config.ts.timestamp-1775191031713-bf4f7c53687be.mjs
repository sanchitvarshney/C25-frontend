// vite.config.ts
import { defineConfig } from "file:///C:/Users/shivk/OneDrive/Desktop/Project/Alwar-ims-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/shivk/OneDrive/Desktop/Project/Alwar-ims-frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import tsconfigPaths from "file:///C:/Users/shivk/OneDrive/Desktop/Project/Alwar-ims-frontend/node_modules/vite-tsconfig-paths/dist/index.mjs";
import tailwindcss from "file:///C:/Users/shivk/OneDrive/Desktop/Project/Alwar-ims-frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\shivk\\OneDrive\\Desktop\\Project\\Alwar-ims-frontend";
var vite_config_default = defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__vite_injected_original_dirname, "src")
      }
    ]
  },
  optimizeDeps: {
    include: ["@mui/material", "@mui/material/styles", "@emotion/react", "@emotion/styled"]
  },
  server: {
    port: 3e3,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "antd": ["antd"],
          "mui-vendor": ["@mui/material", "@mui/material/styles", "@emotion/react", "@emotion/styled"],
          "react-vendor": ["react", "react-dom", "react-router-dom"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzaGl2a1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFByb2plY3RcXFxcQWx3YXItaW1zLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzaGl2a1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFByb2plY3RcXFxcQWx3YXItaW1zLWZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9zaGl2ay9PbmVEcml2ZS9EZXNrdG9wL1Byb2plY3QvQWx3YXItaW1zLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKSwgdHNjb25maWdQYXRocygpLCB0YWlsd2luZGNzcygpXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgZmluZDogXCJAXCIsXHJcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogWydAbXVpL21hdGVyaWFsJywgJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJywgJ0BlbW90aW9uL3JlYWN0JywgJ0BlbW90aW9uL3N0eWxlZCddLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAzMDAwLFxyXG4gICAgaG9zdDogdHJ1ZSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ2FudGQnOiBbJ2FudGQnXSxcclxuICAgICAgICAgICdtdWktdmVuZG9yJzogWydAbXVpL21hdGVyaWFsJywgJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJywgJ0BlbW90aW9uL3JlYWN0JywgJ0BlbW90aW9uL3N0eWxlZCddLFxyXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4VyxTQUFTLG9CQUFvQjtBQUMzWSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8saUJBQWlCO0FBSnhCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQ2pELFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDNUM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGlCQUFpQix3QkFBd0Isa0JBQWtCLGlCQUFpQjtBQUFBLEVBQ3hGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLE1BQU07QUFBQSxVQUNmLGNBQWMsQ0FBQyxpQkFBaUIsd0JBQXdCLGtCQUFrQixpQkFBaUI7QUFBQSxVQUMzRixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsUUFDM0Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
