import { DistributionType, Variance } from "../services/variance";

export class Water {
	private _actualVolumeMl: number;
	private _usedVolumeMl: number = 0;
	private _actualTempC: number;
	readonly nominalVolumeMl: number;
	readonly nominalTempC: number;
	readonly seed?: number;

	constructor({
		nominalVolumeMl,
		nominalTempC,
		seed,
	}: {
		nominalVolumeMl: number;
		nominalTempC: number;
		seed?: number;
	}) {
		this.seed = seed;
		this.nominalTempC = nominalTempC;
		this.nominalVolumeMl = nominalVolumeMl;

		this._actualVolumeMl = Variance.applyVolumeVarianceMl(nominalVolumeMl, {
			variance: 0.03,
			seed: seed,
		});

		const tempSeed = seed !== undefined ? seed + 200 : undefined;

		this._actualTempC = Variance.applyVariance(nominalTempC, {
			distribution: DistributionType.UNIFORM,
			variance: 0.02,
			seed: tempSeed,
		});
	}

	get actualVolumeMl(): number {
		return this._actualVolumeMl;
	}
	get actualTempC(): number {
		return this._actualTempC;
	}
	get usedVolumeMl(): number {
		return this._usedVolumeMl;
	}
	get remainingVolumeMl(): number {
		return this._actualVolumeMl - this._usedVolumeMl;
	}

	heatTo(targetTempC: number, efficiency: number = 1.0) {
		if (targetTempC < this._actualTempC) {
			throw new Error("err-water-target-temp-lower");
		}
		const actualTempReached = targetTempC * efficiency;
		this._actualTempC = Math.min(actualTempReached, targetTempC);
	}

	coolDown(tempLossC: number, ambientTempC: number = 20) {
		this._actualTempC = Math.max(ambientTempC, this._actualTempC - tempLossC);
	}

	useWater(volumeMl: number): boolean {
		if (this.remainingVolumeMl >= volumeMl) {
			this._usedVolumeMl += volumeMl;
			return true;
		}
		return false;
	}

	simulateTemperatureLoss(elapsedMs: number, ambientTempC: number = 20) {
		const coolingRateMs = 0.00001;
		const tempDifferenceC = this._actualTempC - ambientTempC;
		const tempLossC = tempDifferenceC * coolingRateMs * elapsedMs;

		this._actualTempC = Math.max(ambientTempC, this._actualTempC - tempLossC);
	}

	reset() {
		this._actualVolumeMl = Variance.applyVolumeVarianceMl(
			this.nominalVolumeMl,
			{
				variance: 0.03,
				seed: this.seed,
			},
		);

		const tempSeed = this.seed !== undefined ? this.seed + 200 : undefined;

		this._actualTempC = Variance.applyVariance(this.nominalTempC, {
			distribution: DistributionType.UNIFORM,
			variance: 0.02,
			seed: tempSeed,
		});

		this._usedVolumeMl = 0;
	}
}
