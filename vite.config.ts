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
    // Force SWC (not esbuild) for JSX in production builds by providing an
    // empty plugins array. Without this, the plugin delegates JSX to esbuild,
    // and Vite sets esbuild.jsxDev based on mode — which Railway overrides to
    // "development", causing _jsxDEV calls in the bundle.
    react({ plugins: [] }),
    mode === "development" && process.env.LOVABLE_DEV_SERVER === "true" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.JPG"],
}));
