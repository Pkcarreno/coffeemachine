import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    watch: false,
    setupFiles: ["./src/test/helpers/matchers.ts"],
  },
});
