// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "_mocks_/**", "msw/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        "_mocks_/**",
        "msw/**",
        "eslint.config.js",
        "vite.config.ts",
        "vitest.config.ts",
        "public/mockServiceWorker.js",
        "src/setupTests.ts",
        "src/main.tsx",
        "src/App.tsx",
        "src/Routes.ts",
        "src/app/RoutesList.tsx",
        "src/.*/index.ts",
      ],
    },
  },
});
