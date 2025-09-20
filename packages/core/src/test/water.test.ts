import { describe, it, expect } from "vitest";
import { Water } from "../core/entities/water";

const SEED = 12345;

describe("Water", () => {
	it("should create water with statistical variance", () => {
		const water = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
			seed: SEED,
		});

		expect(water.actualTempC).toBeWithin(91, 93);
		expect(water.actualVolumeMl).toBeWithin(39, 41);
	});

	it("should be reproducible with seed", () => {
		const water1 = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
			seed: SEED,
		});

		const water2 = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
			seed: SEED,
		});

		expect(water1.actualTempC).toEqual(water2.actualTempC);
		expect(water1.actualVolumeMl).toEqual(water2.actualVolumeMl);
		expect(water1.nominalTempC).toEqual(water2.nominalTempC);
		expect(water1.nominalVolumeMl).toEqual(water2.nominalVolumeMl);
	});

	it("should be random without seed", () => {
		const water1 = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
		});
		const water2 = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
		});

		expect(water1.actualTempC).toBeWithin(89, 95);
		expect(water2.actualTempC).toBeWithin(89, 95);
		expect(water1.actualVolumeMl).toBeWithin(38, 42);
		expect(water2.actualVolumeMl).toBeWithin(38, 42);
	});

	it("should heat up to value with full efficiency", () => {
		const water = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
			seed: SEED,
		});
		water.heatTo(100);
		expect(water.actualTempC).toBeWithin(99, 101);
	});

	it("should throw error when heating below nominal temperature", () => {
		const water = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
			seed: SEED,
		});
		expect(() => water.heatTo(90)).toThrow();
	});

	it("should cool down a grade celsius", () => {
		const water = new Water({
			nominalTempC: 92,
			nominalVolumeMl: 40,
			seed: SEED,
		});

		water.coolDown;

		expect(water.actualTempC).toBeCloseTo(91, 0);
	});
});
