import { BrewedCoffee } from "../core/entities/brewedCoffee";
import { Coffee, CoffeeType, GrindSize } from "../core/entities/coffee";
import { HeatBuilder, HeatSource } from "../core/entities/heat";
import { Water } from "../core/entities/water";
import { EspressoMachine } from "../machines/espressoMachine";
import { Timer } from "../core/services/timer";

export async function runEspressoSimulation() {
	console.log("=== Espresso Simulation ===\n");

	Timer.setTimeScale(1);

	const machine = new EspressoMachine();
	const coffee = new Coffee({
		type: CoffeeType.ARABICA,
		nominalWeightG: 20,
		grindSize: GrindSize.FINE,
	});
	const water = new Water({ nominalVolumeMl: 36, nominalTempC: 90 });
	const heat = new HeatBuilder()
		.setHeatSource(HeatSource.ELECTRIC)
		.setHeatPowerW(1500)
		.build();

	console.log("Ingredients:");
	console.log(
		`Coffee: ${coffee.actualWeightG}g ${coffee.type} (${coffee.grindSize})`,
	);
	console.log(
		`Water: ${water.actualVolumeMl.toFixed(2)}ml at ${water.actualTempC.toFixed(1)}c\n`,
	);

	console.log("System:");
	console.log(`Heat: ${heat.heatSource} with power ${heat.heatPowerW}W\n`);

	try {
		console.log("Assembling machine...");
		await machine.assembleMachine(coffee, water, heat);
		console.log("Machine ready!\n");

		console.log("Brewing espresso...");

		const generator = machine.brew();
		let stepCount = 0;
		let result: BrewedCoffee;

		while (true) {
			const { value: step, done } = await generator.next();

			if (done) {
				result = step as BrewedCoffee;
				break;
			}

			stepCount++;

			let output = `Step ${stepCount}: ${step.step}`;

			if (step.timeRemainingMs > 0) {
				output += ` (${Math.round(step.timeRemainingMs / 1000)}s remaining)`;
			}

			if (step.pressureBars) {
				output += ` | Pressure: ${step.pressureBars} bars)`;
			}

			if (step.temperatureC) {
				output += ` | Temperature: ${step.temperatureC.toFixed(1)}c)`;
			}

			console.log(output);
		}

		console.log("\n Brewing complete!\n");

		if (result instanceof BrewedCoffee) {
			const brewInfo = result.getBrewInfo();
			console.log("Brewed Details:");

			console.log(`volume: ${brewInfo.volume}`);
			console.log(`category: ${brewInfo.category}`);
			console.log(`temperature: ${brewInfo.temperature}`);
			console.log(`extraction: ${brewInfo.extraction}`);
			console.log(`total disolved solids (TDS): ${brewInfo.tds}`);
		}
	} catch (error) {
		console.error("Espresso Error:", error);
	}
}

if (import.meta.main) {
	runEspressoSimulation();
}
