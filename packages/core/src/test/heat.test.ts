import { describe, it, expect } from "vitest";
import {
	FlameIntensity,
	Heat,
	HeatBuilder,
	HeatSource,
} from "../core/entities/heat";

describe("Heat", () => {
	it("should create a heat instance", () => {
		const electricHeat = new HeatBuilder()
			.setHeatSource(HeatSource.ELECTRIC)
			.setHeatPowerW(300)
			.build();
		const gasHeat = new HeatBuilder()
			.setHeatSource(HeatSource.GAS)
			.setFlameIntensity(FlameIntensity.MEDIUM)
			.build();

		expect(electricHeat).toBeInstanceOf(Heat);
		expect(gasHeat).toBeInstanceOf(Heat);
	});

	it("should create a heat instance with setted power", () => {
		const electricHeat = new HeatBuilder()
			.setHeatSource(HeatSource.ELECTRIC)
			.setHeatPowerW(300)
			.build();
		const gasHeat = new HeatBuilder()
			.setHeatSource(HeatSource.GAS)
			.setFlameIntensity(FlameIntensity.MEDIUM)
			.build();

		expect(electricHeat.heatPowerW).toEqual(300);
		expect(gasHeat.heatPowerW).toBeCloseTo(659, 0);
	});
});
