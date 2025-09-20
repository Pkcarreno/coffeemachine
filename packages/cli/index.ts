import { intro, log, outro, select } from "@clack/prompts";
import { espressoBuilder } from "./machines/espresso";

enum MachineType {
  ESPRESSO = "espresso",
}

async function madeCoffee() {
  intro(`Coffee Simulator`);
  log.message("lets figure out which coffee you want today.");

  const machineType = await select({
    message: "Pick a machine type.",
    initialValue: "espresso",
    options: [{ value: "espresso", label: "Espresso" }],
  });

  switch (machineType) {
    case MachineType.ESPRESSO:
      await espressoBuilder();
      break;
    default:
      outro(`Machine not initialValue!`);
      break;
  }

  process.exit(0);
}

await madeCoffee();
