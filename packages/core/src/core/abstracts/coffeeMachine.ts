import { BrewedCoffee } from "../entities/brewedCoffee";
import type { Coffee, GrindSize } from "../entities/coffee";
import type { Heat } from "../entities/heat";
import type { Water } from "../entities/water";

export interface BrewingParameters {
	waterTempC: number;
	brewTimeMs: number;
	coffeeToWaterRatio: number;
}

export interface BrewingStep {
	step: string;
	timeRemainingMs: number;
	pressureBars?: number;
	volumeExtractedMl?: number;
	temperatureC?: number;
}

interface Ready {
	coffee: Coffee;
	water: Water;
	heat: Heat;
}

export abstract class CoffeeMachine {
	protected coffee?: Coffee;
	protected water?: Water;
	protected heat?: Heat;
	protected isAssembled: boolean = false;
	protected totalWaterUsedMl = 0;

	abstract getRequiredGrindSize(): GrindSize;
	abstract getBrewingParameters(): BrewingParameters;

	async assembleMachine(coffee: Coffee, water: Water, heat: Heat) {
		await this.validateIngredients(coffee, water, heat);

		this.coffee = coffee;
		this.water = water;
		this.heat = heat;
		this.totalWaterUsedMl = 0;

		this.isAssembled = true;
	}

	abstract brew(): AsyncGenerator<BrewingStep, BrewedCoffee>;

	protected abstract validateIngredients(
		coffee: Coffee,
		water: Water,
		heat: Heat,
	): Promise<void>;
	protected abstract setupHeat(): AsyncGenerator<BrewingStep>;
	protected abstract performPreBrew(): AsyncGenerator<BrewingStep>;

	protected finalizeBrewedCoffee(): BrewedCoffee {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		return new BrewedCoffee({
			waterUsedMl: this.water.usedVolumeMl,
			coffeeUsedG: this.coffee.actualWeightG,
			brewTemperatureC: this.water.actualTempC,
			extractionRate: this.coffee.getExtractionRate(),
		});
	}

	protected isReady(this: this): this is this & Ready {
		return this.isAssembled && !!this.coffee && !!this.water && !!this.heat;
	}

	extraction() {
		console.log("Extracting coffee...");
	}
}
