import {
	CoffeeMachine,
	type BrewingStep,
} from "../core/abstracts/coffeeMachine";
import { GrindSize, type Coffee } from "../core/entities/coffee";
import { HeatSource, type Heat } from "../core/entities/heat";
import type { Water } from "../core/entities/water";
import { Timer } from "../core/services/timer";
import { DistributionType, Variance } from "../core/services/variance";

export class EspressoMachine extends CoffeeMachine {
	private pressureBars = 0;
	private readonly targetPressureBars = 9;
	private baseSeed?: number;
	private readonly minWaterMl = 30;
	private readonly maxWaterMl = 60;
	private targetTempC: number = 0;
	private readonly idealTargetTempC = 93;

	constructor(args?: { seed?: number }) {
		super();

		this.baseSeed = args?.seed;
	}

	getRequiredGrindSize(): GrindSize {
		return GrindSize.FINE;
	}

	override async assembleMachine(coffee: Coffee, water: Water, heat: Heat) {
		await super.assembleMachine(coffee, water, heat);
	}

	getBrewingParameters() {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		const timeSeed =
			this.baseSeed !== undefined ? this.baseSeed + 400 : undefined;

		return {
			waterTempC: this.water.actualTempC,
			brewTimeMs: Variance.applyTimeVarianceMs(25_000, {
				variance: 0.15,
				seed: timeSeed,
			}),
			coffeeToWaterRatio: 2,
		};
	}

	async *brew() {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		yield* this.setupHeat();

		yield* this.performPreBrew();

		yield* this.preInfusion();

		yield* this.pressureBuildUp();

		yield* this.mainExtraction();

		return this.finalizeBrewedCoffee();
	}

	protected async *setupHeat(): AsyncGenerator<BrewingStep> {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		const targetTempSeed =
			this.baseSeed !== undefined ? this.baseSeed + 600 : undefined;

		this.targetTempC = Variance.applyVariance(this.idealTargetTempC, {
			distribution: DistributionType.UNIFORM,
			variance: 0.02,
			seed: targetTempSeed,
		});

		const heatupTimeMs = this.heat.calculateHeatTime({
			volumeMl: this.water.actualVolumeMl,
			initialTempC: this.water.actualTempC,
			targetTempC: this.targetTempC,
			efficiency: 1,
		});

		let lastTempValueC = 0;

		for await (const step of Timer.timeProcess({
			processName: "Heat water",
			totalSimulatedMs: heatupTimeMs,
		})) {
			const progressTempC =
				this.water.actualTempC +
				(this.targetTempC - this.water.actualTempC) * step.progress;
			lastTempValueC = progressTempC;

			yield {
				step: "heat-water",
				timeRemainingMs: step.remainingMs,
				pressureBars: this.pressureBars,
				temperatureC: progressTempC,
			};
		}

		this.water.heatTo(lastTempValueC);
	}

	protected async *performPreBrew(): AsyncGenerator<BrewingStep> {
		const preBrewSeed =
			this.baseSeed !== undefined ? this.baseSeed + 50 : undefined;
		const preBrewTimeMs = Variance.applyTimeVarianceMs(2_000, {
			seed: preBrewSeed,
		});

		yield {
			step: "pre-brew",
			timeRemainingMs: preBrewTimeMs,
		};

		await Timer.waitMs(preBrewTimeMs);
	}

	private async *preInfusion(): AsyncGenerator<BrewingStep> {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		const preInfusionSeed =
			this.baseSeed !== undefined ? this.baseSeed + 500 : undefined;

		const preInfusionTimeMs = Variance.applyTimeVarianceMs(3_000, {
			seed: preInfusionSeed,
		});

		this.water.coolDown(1);

		yield {
			step: "pre-infusion",
			timeRemainingMs: preInfusionTimeMs,
			pressureBars: 2,
			temperatureC: this.water.actualTempC,
		};

		await Timer.waitMs(preInfusionTimeMs);
		this.pressureBars = 2;
	}

	private async *pressureBuildUp(): AsyncGenerator<BrewingStep> {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		for (
			let targetPressure = 3;
			targetPressure <= this.targetPressureBars;
			targetPressure++
		) {
			const stepSeed =
				this.baseSeed !== undefined
					? this.baseSeed + 600 + targetPressure
					: undefined;
			const stepTimeMs = Variance.applyTimeVarianceMs(500, {
				variance: 0.2,
				distribution: DistributionType.EXPONENTIAL,
				seed: stepSeed,
			});

			const totalRemainingMs = (this.targetPressureBars - targetPressure) * 500;
			this.water.coolDown(0.2);

			yield {
				step: "pressure-buildup",
				timeRemainingMs: totalRemainingMs,
				pressureBars: targetPressure,
				temperatureC: this.water.actualTempC,
			};

			await Timer.waitMs(stepTimeMs);
			this.pressureBars = targetPressure;
		}
	}

	private async *mainExtraction(): AsyncGenerator<BrewingStep> {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		const brewTimeMs = this.getBrewingParameters().brewTimeMs;
		const stepIntervalMs = 1_000;

		for (
			let elapsedMs = 0;
			elapsedMs < brewTimeMs;
			elapsedMs += stepIntervalMs
		) {
			const remainingMs = brewTimeMs - elapsedMs;
			const volumeExtractedMl = this.calculateExtractionMl(elapsedMs);

			this.water.simulateTemperatureLoss(stepIntervalMs);

			const waterToUse = volumeExtractedMl - this.water.usedVolumeMl;
			if (waterToUse > 0) {
				this.water.useWater(waterToUse);
			}

			yield {
				step: "extraction",
				timeRemainingMs: remainingMs,
				pressureBars: this.pressureBars,
				volumeExtractedMl,
				temperatureC: this.water.actualTempC,
			};

			await Timer.waitMs(Math.min(stepIntervalMs, remainingMs));
		}
	}

	protected async validateIngredients(
		coffee: Coffee,
		water: Water,
		heat: Heat,
	) {
		if (!coffee) {
			throw new Error("err-machine-invalid-coffee");
		}

		if (water.actualVolumeMl < this.minWaterMl) {
			throw new Error("err-machine-invalid-water-low-volume");
		}

		if (water.actualVolumeMl > this.maxWaterMl) {
			throw new Error("err-machine-invalid-water-high-volume");
		}

		if (water.actualTempC < 85) {
			throw new Error("err-machine-invalid-water-low-temperature");
		}

		if (water.actualTempC > 96) {
			throw new Error("err-machine-invalid-water-high-temperature");
		}

		if (heat.heatSource !== HeatSource.ELECTRIC) {
			throw new Error("err-machine-invalid-heat-source");
		}
	}

	private calculateExtractionMl(elapsedMs: number): number {
		if (!this.isReady()) {
			throw new Error("err-machine-not-ready");
		}

		const params = this.getBrewingParameters();
		const progress = elapsedMs / params.brewTimeMs;

		const extractionRate = 1 - Math.exp(-3 * progress);
		const targetVolumeMl =
			this.coffee.actualWeightG * params.coffeeToWaterRatio;

		const extractionSeed =
			this.baseSeed !== undefined
				? this.baseSeed * 700 + Math.floor(elapsedMs / 1_000)
				: undefined;

		const extractedVolumeMl = Variance.applyVolumeVarianceMl(
			targetVolumeMl * extractionRate,
			{
				distribution: DistributionType.NORMAL,
				variance: 0.05,
				seed: extractionSeed,
			},
		);

		return Math.min(extractedVolumeMl, targetVolumeMl);
	}
}
