import {
	cancel,
	confirm,
	group,
	log,
	note,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import {
	BrewedCoffee,
	Coffee,
	GrindSize,
	CoffeeType,
	Water,
	Heat,
	HeatSource,
} from "@coffee-machine/core";
import { EspressoMachine } from "@coffee-machine/core/machines";

export const espressoBuilder = async () => {
	log.info("Espresso configuration");

	try {
		log.step("Configure your coffee beans");

		const coffeeConfig = await group(
			{
				type: () =>
					select({
						message: `What type of coffee beans?`,
						options: Object.values(CoffeeType).map((key) => ({
							value: key,
							label: key,
						})),
					}),
				nominalWeightG: () =>
					text({
						message: "How much coffee? (grams)",
						defaultValue: "20",
						placeholder: "20",
						validate: (value) => {
							const num = Number(value);
							if (Number.isNaN(num)) return "Please enter a valid number";
							if (num < 10 || num > 30)
								return "For espresso use between 10-30 grams";
						},
					}),
				grindSize: () =>
					select({
						message: `Coffee grind size?`,
						options: Object.values(GrindSize).map((key) => ({
							value: key,
							label: key,
						})),
					}),
			},
			{
				onCancel: () => {
					cancel("Operation cancelled.");
					process.exit(0);
				},
			},
		);

		const coffee = new Coffee({
			nominalWeightG: Number(coffeeConfig.nominalWeightG),
			type: coffeeConfig.type as CoffeeType,
			grindSize: coffeeConfig.grindSize as GrindSize,
		});

		log.step("Configure your water");

		const waterConfig = await group(
			{
				nominalVolumeMl: () =>
					text({
						message: "Water volume? (milliliters)",
						defaultValue: "36",
						placeholder: "36",
						validate: (value) => {
							const num = Number(value);
							if (Number.isNaN(num)) return "Please enter a valid number";
							if (num < 20 || num > 60)
								return "For espresso use between 20-60ml";
						},
					}),
			},
			{
				onCancel: () => {
					cancel("Operation cancelled.");
					process.exit(0);
				},
			},
		);

		const water = new Water({
			nominalVolumeMl: Number(waterConfig.nominalVolumeMl),
			nominalTempC: 88,
		});

		const heat = new Heat({
			heatPowerW: 1500,
			heatSource: HeatSource.ELECTRIC,
		});

		note(
			`Coffee: ${coffee.actualWeightG}g ${coffee.type} ${coffee.grindSize}\n` +
				`Water: ${water.nominalVolumeMl}ml at ${water.nominalTempC}°C\n` +
				`Heat: ${heat.heatSource} ${heat.heatPowerW}W`,
			"Configuration Summary",
		);

		const confirmBrewing = await confirm({
			message: "Ready to start brewing?",
			initialValue: true,
		});

		if (!confirmBrewing) {
			outro("Maybe next time!");
			process.exit(0);
		}

		log.step("Initializing espresso machine...");

		const machine = new EspressoMachine();

		const s = spinner();
		s.start("Assembling machine...");

		try {
			await machine.assembleMachine(coffee, water, heat);
			s.stop("Machine ready!");
		} catch (err) {
			s.stop("Error");
			if (err instanceof Error) {
				log.error(`Brewing failed: ${err.message}`);
			}
			outro("Something went wrong. Please try again.");
		}

		const brewingSpinner = spinner();
		const generator = machine.brew();
		let result: BrewedCoffee | undefined;
		try {
			brewingSpinner.start("Brewing your espresso...");

			while (true) {
				const { value: step, done } = await generator.next();

				if (done) {
					result = step as BrewedCoffee;
					break;
				}

				let message = "";

				switch (step.step) {
					case "heat-water":
						message = "Heating water";
						break;
					case "pre-brew":
						message = "Pre-heating portfilter";
						break;
					case "pre-infusion":
						message = "Pre-infusion";
						break;
					case "pressure-buildup":
						message = "Building pressure";
						break;
					case "extraction":
						message = "Extracting";
						break;
					default:
						message = `${step.step}`;
						break;
				}

				if (step.timeRemainingMs > 0) {
					message += ` (${Math.round(step.timeRemainingMs / 1000)}s remaining)`;
				}

				if (step.pressureBars) {
					message += ` | Pressure: ${step.pressureBars} bars)`;
				}

				if (step.temperatureC) {
					message += ` | Temperature: ${step.temperatureC.toFixed(1)}c`;
				}

				brewingSpinner.message(message);
			}

			brewingSpinner.stop("Brewing completed!");
		} catch (err) {
			brewingSpinner.stop("Brewing failed!");
			if (err instanceof Error) {
				log.error(`Brewing failed: ${err.message}`);
			}
			outro("Something went wrong. Please try again.");
		}

		try {
			if (result && result instanceof BrewedCoffee) {
				const brewInfo = result.getBrewInfo();

				note(
					`Volume: ${brewInfo.volume}\n` +
						`Temperature: ${brewInfo.temperature}\n` +
						`Extraction: ${brewInfo.extraction}\n` +
						`TDS: ${brewInfo.tds}\n` +
						`Quality: ${brewInfo.category}`,
					"Your Espresso is Ready!",
				);

				const category = brewInfo.category;
				if (category === "optimal") {
					outro("Perfect espresso! Enjoy your coffee!");
				} else if (category === "under-extracted") {
					outro(
						"Slightly under-extracted. Try finer grind or longer extraction next time.",
					);
				} else {
					outro(
						"Over-extracted. Try coarser grind or shorter extraction next time.",
					);
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				log.error(`Brewing failed: ${err.message}`);
			}
			outro("Something went wrong. Please try again.");
		}
	} catch (error) {
		if (error instanceof Error) {
			log.error(`Configuration error: ${error.message}`);
		}
		outro("Configuration failed. Please try again.");
	}
};
