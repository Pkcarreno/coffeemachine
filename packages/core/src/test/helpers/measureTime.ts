export class MeasureTime {
	private startTime: number | undefined;
	private endTime: number | undefined;

	private start() {
		if (this.startTime !== undefined)
			throw new Error("Reset before mesure again");

		this.startTime = Date.now();
	}

	private end() {
		if (this.startTime === undefined)
			throw new Error("Call start() before end()");

		if (this.endTime !== undefined)
			throw new Error("Reset before mesure again");

		this.endTime = Date.now();
	}

	private getDiffMs(): number {
		if (this.startTime === undefined || this.endTime === undefined)
			throw new Error("Call getDiff after called start() and end() functions");

		return Math.round(this.endTime - this.startTime);
	}

	reset() {
		this.startTime = undefined;
		this.endTime = undefined;
	}

	async process<T>(
		fn: () => Promise<T>,
	): Promise<{ result: T; timeMs: number }> {
		this.reset();
		this.start();

		const result = await fn();

		this.end();

		const timeMs = this.getDiffMs();

		this.reset();

		return { result, timeMs };
	}
}
