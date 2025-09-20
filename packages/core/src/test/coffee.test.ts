import { describe, it, expect } from "vitest";
import { Coffee, CoffeeType, GrindSize } from "../core/entities/coffee";

const SEED = 12345;

describe("Coffee", () => {
	it("should create coffee with statistical variance", () => {
		const coffee = new Coffee({
			type: CoffeeType.ARABICA,
			nominalWeightG: 20,
			grindSize: GrindSize.MEDIUM,
			seed: SEED,
		});

		expect(coffee.actualWeightG).toBeCloseTo(20, 0);
		expect(coffee.type).toBe(CoffeeType.ARABICA);
		expect(coffee.grindSize).toBe(GrindSize.MEDIUM);
	});

	it("should be reproducible with seed", () => {
		const coffee1 = new Coffee({
			type: CoffeeType.ARABICA,
			nominalWeightG: 20,
			grindSize: GrindSize.MEDIUM,
			seed: SEED,
		});
		const coffee2 = new Coffee({
			type: CoffeeType.ARABICA,
			nominalWeightG: 20,
			grindSize: GrindSize.MEDIUM,
			seed: SEED,
		});

		expect(coffee1.actualWeightG).toEqual(coffee2.actualWeightG);
		expect(coffee1.getExtractionRate()).toEqual(coffee2.getExtractionRate());
	});

	it("should be random without seed", () => {
		const coffee1 = new Coffee({
			type: CoffeeType.ARABICA,
			nominalWeightG: 20,
			grindSize: GrindSize.MEDIUM,
		});
		const coffee2 = new Coffee({
			type: CoffeeType.ARABICA,
			nominalWeightG: 20,
			grindSize: GrindSize.MEDIUM,
		});

		expect(coffee1.actualWeightG).toBeWithin(19, 21);
		expect(coffee2.actualWeightG).toBeWithin(19, 21);
		expect(coffee1.getExtractionRate()).toBeCloseTo(
			coffee2.getExtractionRate(),
			0,
		);
	});
});
