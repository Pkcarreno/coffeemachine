# @coffee-machine/core ☕️⚙️

Core abstractions and implementations for simulating realistic coffee machines in TypeScript.

## Installation

```bash
npm install @coffee-machine/core
```

## Basic Usage

```typescript
import { Coffee, Water, Heat, CoffeeType, GrindSize, HeatSource CoffeeType, GrindSize, HeatSource } from "@coffee-machine/core";
import { EspressoMachine } from "@coffee-machine/core/machines";

// Configure your coffee setup
const coffee = new Coffee({
  type: CoffeeType.ARABICA,
  nominalWeightG: 20,
  grindSize: GrindSize.FINE,
});

const water = new Water({
  nominalVolumeMl: 36,
  nominalTempC: 25,
});

const heat = new Heat({
  heatSource: HeatSource.ELECTRIC,
  heatPowerW: 1500,
});

// Create and run the machine
const machine = new EspressoMachine();
await machine.assembleMachine(coffee, water, heat);

// Brew with real-time updates
for await (const step of machine.brew()) {
  console.log(`${step.step}: ${step.temperatureC}°C`);
}
```

## What's Inside

### Core Entities

- **Coffee** - Bean configuration and properties
- **Water** - Temperature and volume management
- **Heat** - Heating system simulation

### Machine Abstractions

- **CoffeeMachine** - Abstract base class for all machines
- **EspressoMachine** - Ready-to-use espresso implementation

For implementing your own machines, reference the existing **EspressoMachine** implementation in the [`machines/` directory](./src/machines/) and for usage check the [`examples/` directory](./src/examples/).

## Brewing Process

The simulation follows realistic coffee extraction:

1. **Assembly** - Validate and configure components
2. **Heating** - Reach optimal water temperature
3. **Pre-brew** - Prepare machine for extraction
4. **Pre-infusion** - Initial wetting phase
5. **Extraction** - Main brewing with pressure buildup
6. **Completion** - Final output and cleanup

---

A passion project I tinker with for fun. New features and machines will be added as I explore interesting applications.

For terminal brewing: [@coffee-machine/cli](../cli/README.md)
