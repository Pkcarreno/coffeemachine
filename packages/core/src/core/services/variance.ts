export enum DistributionType {
	NORMAL = "normal",
	UNIFORM = "uniform",
	EXPONENTIAL = "exponential",
	TRIANGULAR = "triangular",
}

interface VarianceConfig {
	distribution: DistributionType;
	variance: number;
	seed?: number;
}

export class Variance {
	static applyVariance(baseValue: number, config: VarianceConfig): number {
		const random =
			config.seed !== undefined
				? Variance.seededRandom(config.seed)
				: Math.random();

		switch (config.distribution) {
			case DistributionType.NORMAL:
				return Variance.normalDistribution({
					mean: baseValue,
					variance: config.variance,
					seed: config.seed,
				});
			case DistributionType.UNIFORM:
				return Variance.uniformDistribution({
					center: baseValue,
					range: config.variance,
					random,
				});
			case DistributionType.EXPONENTIAL:
				return Variance.exponentialDistribution({
					mean: baseValue,
					lambda: config.variance,
					random,
				});
			case DistributionType.TRIANGULAR:
				return Variance.triangularDistribution({
					center: baseValue,
					variance: baseValue,
					random,
				});
			default:
				throw new Error("err-variance-inexistent-distribution");
		}
	}

	private static seededRandom(seed: number): number {
		const x = Math.sin(seed) * 10_000;
		return x - Math.floor(x);
	}

	private static normalDistribution(args: {
		mean: number;
		variance: number;
		seed?: number;
	}): number {
		const { mean, variance, seed } = args;

		const u1 = seed !== undefined ? Variance.seededRandom(seed) : Math.random();
		const u2 =
			seed !== undefined ? Variance.seededRandom(seed + 1) : Math.random();
		const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
		return mean + Math.sqrt(variance) * z;
	}

	private static uniformDistribution(args: {
		center: number;
		range: number;
		random: number;
	}): number {
		const { center, range, random } = args;

		const deviation = center * range;
		return center + (random - 0.5) * 2 * deviation;
	}

	private static exponentialDistribution(args: {
		mean: number;
		lambda: number;
		random: number;
	}): number {
		const { mean, lambda, random } = args;

		return (
			mean + (-Math.log(Math.max(0.000001, 1 - random)) / lambda) * mean * 0.1
		);
	}

	private static triangularDistribution(args: {
		center: number;
		variance: number;
		random: number;
	}): number {
		const { center, variance, random } = args;
		const deviation = center * variance;

		if (random < 0.5) {
			return center - deviation + deviation * Math.sqrt(2 * random);
		} else {
			return center + deviation - deviation * Math.sqrt(2 * (1 - random));
		}
	}

	static applyWeightVarianceG(
		weightG: number,
		args?: {
			variance?: number;
			distribution?: DistributionType;
			seed?: number;
		},
	): number {
		const {
			variance = 0.02,
			distribution = DistributionType.NORMAL,
			seed,
		} = args || {};

		const result = Variance.applyVariance(weightG, {
			distribution,
			variance,
			seed,
		});

		return Math.max(0.1, Number(result.toFixed(1)));
	}

	static applyTimeVarianceMs(
		baseTimeMs: number,
		args?: {
			variance?: number;
			distribution?: DistributionType;
			seed?: number;
		},
	): number {
		const {
			variance = 0.1,
			distribution = DistributionType.NORMAL,
			seed,
		} = args || {};

		const result = Variance.applyVariance(baseTimeMs, {
			distribution,
			variance,
			seed,
		});

		return Math.max(0, Math.round(result));
	}

	static applyVolumeVarianceMl(
		volumeML: number,
		args?: {
			variance?: number;
			distribution?: DistributionType;
			seed?: number;
		},
	): number {
		const {
			variance = 0.03,
			distribution = DistributionType.UNIFORM,
			seed,
		} = args || {};

		const result = Variance.applyVariance(volumeML, {
			distribution,
			variance,
			seed,
		});

		return Math.max(0.1, Number(result.toFixed(1)));
	}
}
