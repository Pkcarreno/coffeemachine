export enum HeatSource {
	ELECTRIC = "electric",
	GAS = "gas",
}

export enum FlameIntensity {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
}

export const FlameIntensityInBtu = {
	[FlameIntensity.LOW]: 2_000,
	[FlameIntensity.MEDIUM]: 5_000,
	[FlameIntensity.HIGH]: 9_000,
} as const satisfies Record<FlameIntensity, number>;

interface heatConstructorProperties {
	heatSource: HeatSource;
	heatPowerW: number;
}

export class HeatBuilder {
	private heatProperties: Partial<heatConstructorProperties>;

	constructor() {
		this.heatProperties = {};
	}

	setHeatPowerW(heatPowerW: number) {
		this.heatProperties.heatPowerW = heatPowerW;
		return this;
	}

	setFlameIntensity(flameIntensity: FlameIntensity, efficiency: number = 0.45) {
		const kW = (FlameIntensityInBtu[flameIntensity] / 3412) * efficiency;

		this.heatProperties.heatPowerW = kW * 1000;
		return this;
	}

	setHeatSource(heatSource: HeatSource) {
		this.heatProperties.heatSource = heatSource;
		return this;
	}

	build() {
		if (!this.heatProperties.heatSource) {
			throw new Error("err-heatbuilder-heat-source-not-set");
		}
		if (!this.heatProperties.heatPowerW) {
			throw new Error("err-heatbuilder-heat-power-not-set");
		}

		return new Heat(this.heatProperties as heatConstructorProperties);
	}
}

export class Heat {
	readonly heatSource: HeatSource;
	readonly heatPowerW: number;

	constructor(args: heatConstructorProperties) {
		this.heatSource = args.heatSource;
		this.heatPowerW = args.heatPowerW;
	}

	calculateHeatTime(args: {
		volumeMl: number;
		initialTempC: number;
		targetTempC: number;
		efficiency?: number;
	}): number {
		const { volumeMl, initialTempC, targetTempC, efficiency = 0.85 } = args;

		const specificHeat = 4186;
		const deltaTempC = targetTempC - initialTempC;
		return (
			(((volumeMl / 1_000) * specificHeat * deltaTempC) /
				(efficiency * this.heatPowerW)) *
			60 *
			1_000
		);
	}
}
