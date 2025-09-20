export class Timer {
	private static timeScale: number = 1.0; // real time scale

	static setTimeScale(scale: number) {
		if (scale <= 0) {
			throw new Error("err-scale-must-be-greater-than-zero");
		}
		Timer.timeScale = scale;
	}

	static getTimeScale(): number {
		return Timer.timeScale;
	}

	static resetTimeScale() {
		Timer.timeScale = 1.0;
	}

	static async waitMs(simulatedDurationMs: number) {
		const realDurationMs = Math.round(simulatedDurationMs / Timer.timeScale);

		return new Promise((resolve) => {
			setTimeout(resolve, Math.round(realDurationMs));
		});
	}

	static async *timeProcess(args: {
		totalSimulatedMs: number;
		stepIntervalMs?: number;
		processName: string;
	}): AsyncGenerator<{
		step: string;
		remainingMs: number;
		progress: number;
		realTimeMs: number;
		simulatedTimeMs: number;
	}> {
		const {
			processName = "unknown process",
			stepIntervalMs = 1000,
			totalSimulatedMs,
		} = args;

		for (
			let elapsedMs = 0;
			elapsedMs < totalSimulatedMs;
			elapsedMs += stepIntervalMs
		) {
			const remainingMs = totalSimulatedMs - elapsedMs;
			const progress = elapsedMs / totalSimulatedMs;

			yield {
				step: processName,
				remainingMs,
				progress,
				realTimeMs: elapsedMs * Timer.timeScale,
				simulatedTimeMs: elapsedMs,
			};

			const actualStepMs = Math.min(stepIntervalMs, remainingMs);
			await Timer.waitMs(actualStepMs);
		}
	}

	static getTimeInfo(simulatedMs: number): {
		simulatedMs: number;
		realMs: number;
		scale: number;
	} {
		return {
			simulatedMs,
			realMs: simulatedMs * Timer.timeScale,
			scale: Timer.timeScale,
		};
	}
}
