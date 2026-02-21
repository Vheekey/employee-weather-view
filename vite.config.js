import { webcrypto } from "node:crypto";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
  globalThis.crypto = webcrypto;
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9091",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyRes", (proxyRes) => {
            delete proxyRes.headers["www-authenticate"];
          });
        },
      },
    },
  },
});
