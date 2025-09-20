export class BrewedCoffee {
	public readonly volumeMl: number;
	public readonly strengthLevel: number;
	public readonly temperatureC: number;
	public readonly extractionPercentage: number;

	constructor({
		waterUsedMl,
		coffeeUsedG,
		brewTemperatureC,
		extractionRate = 0.02,
	}: {
		waterUsedMl: number;
		coffeeUsedG: number;
		brewTemperatureC: number;
		extractionRate: number;
	}) {
		this.volumeMl = Math.round(waterUsedMl * 0.87);

		const extractedSolidsG = coffeeUsedG * extractionRate;
		this.strengthLevel = Number(
			((extractedSolidsG / this.volumeMl) * 1000).toFixed(1),
		);

		this.temperatureC = Math.round(brewTemperatureC - 2);

		this.extractionPercentage = Number((extractionRate * 100).toFixed(1));
	}

	getStrengthCategory(): "under-extracted" | "optimal" | "over-extracted" {
		if (this.extractionPercentage < 18) return "under-extracted";
		if (this.extractionPercentage > 22) return "over-extracted";
		return "optimal";
	}

	// TDS (Total Dissolved Solids)
	getTDS(): number {
		return Number((this.strengthLevel / 10).toFixed(2));
	}

	getBrewInfo(): {
		volume: string;
		strength: string;
		temperature: string;
		extraction: string;
		category: string;
		tds: string;
	} {
		return {
			volume: `${this.volumeMl}ml`,
			strength: `${this.strengthLevel}mg/ml`,
			temperature: `${this.temperatureC}c`,
			extraction: `${this.extractionPercentage}%`,
			category: this.getStrengthCategory(),
			tds: `${this.getTDS()}%`,
		};
	}
}
