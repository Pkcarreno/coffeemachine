import "vitest";

declare module "vitest" {
	interface Assertion<_T = unknown> {
		toBeWithin(min: number, max: number): void;
	}
	interface AsymmetricMatchersContaining {
		toBeWithin(min: number, max: number): void;
	}
}
