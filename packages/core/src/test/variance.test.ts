import { describe, it, expect } from "vitest";
import { Variance } from "../core/services/variance";

const SEED = 12345;

describe("Variance", () => {
	it("should produce reproducible weight result with same seed", () => {
		const value1 = Variance.applyWeightVarianceG(20, {
			seed: SEED,
		});
		const value2 = Variance.applyWeightVarianceG(20, {
			seed: SEED,
		});

		expect(value1).toEqual(value2);
	});

	it("should produce reproducible time result with same seed", () => {
		const value1 = Variance.applyTimeVarianceMs(20_000, {
			seed: SEED,
		});
		const value2 = Variance.applyTimeVarianceMs(20_000, {
			seed: SEED,
		});

		expect(value1).toEqual(value2);
	});

	it("should produce reproducible volume result with same seed", () => {
		const value1 = Variance.applyVolumeVarianceMl(45, {
			seed: SEED,
		});
		const value2 = Variance.applyVolumeVarianceMl(45, {
			seed: SEED,
		});

		expect(value1).toEqual(value2);
	});
});
