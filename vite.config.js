import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8081,
        hmr: {
            overlay: false,
        },
        proxy: {
            "/api": {
                target: "http://localhost:4200",
                changeOrigin: true,
                secure: false,
            },
            "/uploads": {
                target: "http://localhost:4200",
                changeOrigin: true,
                secure: false,
            },
            "/sso": {
                target: "http://localhost:9000",
                changeOrigin: true,
                secure: false,
                rewrite: (pathValue) => pathValue.replace(/^\/sso/, ""),
            },
        },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
