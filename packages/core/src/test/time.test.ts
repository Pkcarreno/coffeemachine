import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MeasureTime } from "./helpers/measureTime";
import { Timer } from "../core/services/timer";

const measure = new MeasureTime();

describe("Timer", () => {
	beforeEach(() => {
		Timer.resetTimeScale();
		vi.clearAllTimers();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("should wait for correct time at normal scale", async () => {
		const { timeMs } = await measure.process(async () => {
			const waitPromise = Timer.waitMs(1000);
			vi.advanceTimersByTime(1000);
			await waitPromise;
		});

		expect(Timer.getTimeScale()).toBe(1.0);
		expect(timeMs).toBeCloseTo(1000, 0);
	});

	it("should accelerate time with scale < 1", async () => {
		Timer.setTimeScale(0.1);

		const { timeMs } = await measure.process(async () => {
			const waitPromise = Timer.waitMs(1000);
			vi.advanceTimersByTime(10_000);
			await waitPromise;
		});

		expect(Timer.getTimeScale()).toBe(0.1);
		expect(timeMs).toBeCloseTo(10_000, 0);
	});

	it("should slow down time with scale > 1", async () => {
		Timer.setTimeScale(2);

		const { timeMs } = await measure.process(async () => {
			const waitPromise = Timer.waitMs(1000);
			vi.advanceTimersByTime(500);
			await waitPromise;
		});

		expect(Timer.getTimeScale()).toBe(2);
		expect(timeMs).toBeCloseTo(500, 0);
	});

	it("should provide correct time info", () => {
		Timer.setTimeScale(0.5);

		const info = Timer.getTimeInfo(2000);

		expect(info).toEqual({
			simulatedMs: 2000,
			realMs: 1000,
			scale: 0.5,
		});
	});

	it("should throw error for invalid scale", () => {
		expect(() => Timer.setTimeScale(0)).toThrow(
			"err-scale-must-be-greater-than-zero",
		);
		expect(() => Timer.setTimeScale(-1)).toThrow(
			"err-scale-must-be-greater-than-zero",
		);
	});
});
