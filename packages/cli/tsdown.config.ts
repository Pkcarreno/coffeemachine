import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./index.ts"],
	outDir: "./dist",
	platform: "node",
	target: "node20",
	sourcemap: true,
	tsconfig: "tsconfig.json",
	banner: {
		js: "#!/usr/bin/env node",
	},
});
