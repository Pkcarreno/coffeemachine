import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/core/index.ts", "./src/machines/index.ts"],
	outDir: "./dist",
	format: ["esm", "cjs"],
	dts: true,
	platform: "neutral",
});
