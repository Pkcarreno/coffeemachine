import { expect } from "vitest";

function isNumber(n: unknown): n is number {
	return typeof n === "number" && Number.isFinite(n);
}

expect.extend({
	toBeWithin(received: unknown, min: number, max: number) {
		if (!isNumber(received) || !isNumber(min) || !isNumber(max)) {
			return {
				pass: false,
				message: () =>
					`toBeWithin: received/min/max must be finite numbers.\n` +
					`Received: ${String(received)}, min: ${String(min)}, max: ${String(
						max,
					)}`,
			};
		}

		if (min > max) {
			return {
				pass: false,
				message: () =>
					`toBeWithin: "min" cannot be greater than "max" (min=${min}, max=${max})`,
			};
		}

		const pass = received >= min && received <= max;
		const rangeStr = `[${min}, ${max}]`;

		return {
			pass,
			message: () =>
				pass
					? `Expected ${received} NOT to be within range ${rangeStr}`
					: `Expected ${received} to be within range ${rangeStr}`,
			actual: received,
			expected: `between ${rangeStr}`,
		};
	},
});
