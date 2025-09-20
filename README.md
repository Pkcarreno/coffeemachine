# Coffee Machine Simulator ☕️

A monorepo containing abstract coffee machine implementations and a CLI tool for realistic coffee brewing simulations.

## Quick Start

### Using the CLI (Global Installation)

```bash
# Install the CLI globally
npm install -g @coffee-machine/cli

# Start brewing espresso
coffeeMachine
# or
cfm
```

### Using Core Package

```bash
# Install core package
npm install @coffee-machine/core
```

## Packages

- **[`@coffee-machine/core`](./packages/core/README.md)** - Abstract classes and pre-built coffee machine implementations
- **[`@coffee-machine/cli`](./packages/cli/README.md)** - Global CLI tool for terminal-based coffee brewing

## Development (Monorepo)

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

For detailed usage and development instructions, see the individual package READMEs.

## License

MIT
