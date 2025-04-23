// Main entry point for the Swarm-Builder library
export * from './core/models';
export * from './core/orchestrator';
export * from './core/providers';
export * from './adapters';
export * from './ui';

// Entry point for CLI
import { startCLI } from './cli';

if (require.main === module) {
  startCLI();
}
