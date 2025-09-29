import { Variance } from "../services/variance";

export enum CoffeeType {
	ARABICA = "arabica",
	ROBUSTA = "robusta",
	BLEND = "blend",
}

export enum GrindSize {
	EXTRA_COARSE = "extra_coarse",
	COARSE = "coarse",
	MEDIUM = "medium",
	FINE = "fine",
	EXTRA_FINE = "extra_fine",
}

export const ExtractionRateByType = {
	[CoffeeType.ARABICA]: 0.2,
	[CoffeeType.ROBUSTA]: 0.18,
	[CoffeeType.BLEND]: 0.19,
} as const satisfies Record<CoffeeType, number>;

export const GrindModifierByGrindSize = {
	[GrindSize.EXTRA_FINE]: 1.15,
	[GrindSize.FINE]: 1.08,
	[GrindSize.MEDIUM]: 1,
	[GrindSize.COARSE]: 0.92,
	[GrindSize.EXTRA_COARSE]: 0.85,
} as const satisfies Record<GrindSize, number>;

export class Coffee {
	public readonly type: CoffeeType;
	public readonly actualWeightG: number;
	public readonly seed?: number;
	public readonly nominalWeightG: number;
	public readonly grindSize: GrindSize;

	constructor(args: {
		type: CoffeeType;
		nominalWeightG: number;
		grindSize: GrindSize;
		seed?: number;
	}) {
		this.type = args.type;
		this.seed = args.seed;
		this.actualWeightG = Variance.applyWeightVarianceG(args.nominalWeightG, {
			seed: args.seed,
		});
		this.nominalWeightG = args.nominalWeightG;
		this.grindSize = args.grindSize;
	}

	getExtractionRate(): number {
		const rate = ExtractionRateByType[this.type];
		const modifier = GrindModifierByGrindSize[this.grindSize];

		return rate * modifier;
	}
}
