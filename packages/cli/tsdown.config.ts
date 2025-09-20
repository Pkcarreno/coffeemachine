import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./index.ts"],
	outDir: "./dist",
	platform: "node",
	target: "node20",
	sourcemap: true,
	noExternal: [
		"@coffee-machine/core",
		"@coffee-machine/core/machines",
		"@clack/prompts",
	],
	external: [],
	tsconfig: "tsconfig.json",
	clean: true,
});
