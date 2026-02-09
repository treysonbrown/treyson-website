import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["treyson.org"]
  },
  plugins: [
    // Explicitly control JSX runtime: only use dev JSX when running the dev server.
    // This prevents _jsxDEV errors if the build mode is overridden by the deployment platform.
    react({ development: command === "serve" }),
    mode === "development" && process.env.LOVABLE_DEV_SERVER === "true" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.JPG"],
}));
