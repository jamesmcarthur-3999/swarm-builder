// Command-line interface for Swarm-Builder

import { SwarmBuilder } from '../core/models';
import { ModelPresetManager } from '../core/models/model-preset-manager';
import { MCPServerRegistry } from '../core/mcp/mcp-server-registry';
import { SwarmOrchestrator } from '../core/orchestrator';

/**
 * Start the CLI
 */
export function startCLI(): void {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'create':
      handleCreateCommand(args.slice(1));
      break;
    
    case 'run':
      handleRunCommand(args.slice(1));
      break;
    
    case 'config':
      handleConfigCommand(args.slice(1));
      break;
    
    case 'presets':
      handlePresetsCommand(args.slice(1));
      break;
    
    case 'servers':
      handleServersCommand(args.slice(1));
      break;
    
    case 'ui':
      handleUICommand(args.slice(1));
      break;
    
    case '--version':
    case '-v':
      showVersion();
      break;
    
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

/**
 * Handle the create command
 */
function handleCreateCommand(args: string[]): void {
  console.log('Creating a new swarm...');
  // TODO: Implement swarm creation logic
  // This would launch the Service Wizard UI or run a CLI wizard
}

/**
 * Handle the run command
 */
function handleRunCommand(args: string[]): void {
  if (args.length < 1) {
    console.error('Error: Missing service ID');
    console.log('Usage: swarm-builder run <service-id>');
    process.exit(1);
  }
  
  const serviceId = args[0];
  console.log(`Running swarm with ID: ${serviceId}...`);
  
  // Create and start the orchestrator
  const orchestrator = new SwarmOrchestrator(serviceId);
  
  orchestrator.start().then(() => {
    console.log('Swarm started successfully');
    
    // Set up REPL for interaction
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });
    
    rl.prompt();
    
    rl.on('line', async (line: string) => {
      if (line.trim() === 'exit' || line.trim() === 'quit') {
        await orchestrator.stop();
        rl.close();
        return;
      }
      
      try {
        const response = await orchestrator.sendMessage(line);
        console.log(response);
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }
      
      rl.prompt();
    });
    
    rl.on('close', async () => {
      await orchestrator.stop();
      console.log('Swarm stopped');
      process.exit(0);
    });
    
  }).catch(error => {
    console.error(`Error starting swarm: ${error.message}`);
    process.exit(1);
  });
}

/**
 * Handle the config command
 */
function handleConfigCommand(args: string[]): void {
  if (args.length < 1) {
    console.error('Error: Missing config option');
    console.log('Usage: swarm-builder config [--set-anthropic-key=KEY | --set-openai-key=KEY | --edit | --view]');
    process.exit(1);
  }
  
  const option = args[0];
  
  if (option.startsWith('--set-anthropic-key=')) {
    const key = option.split('=')[1];
    console.log('Setting Anthropic API key...');
    // TODO: Implement API key storage
  } else if (option.startsWith('--set-openai-key=')) {
    const key = option.split('=')[1];
    console.log('Setting OpenAI API key...');
    // TODO: Implement API key storage
  } else if (option === '--edit') {
    console.log('Opening config in editor...');
    // TODO: Implement config editing
  } else if (option === '--view') {
    console.log('Viewing config...');
    // TODO: Implement config viewing
  } else {
    console.error(`Error: Unknown config option: ${option}`);
    console.log('Usage: swarm-builder config [--set-anthropic-key=KEY | --set-openai-key=KEY | --edit | --view]');
    process.exit(1);
  }
}

/**
 * Handle the presets command
 */
function handlePresetsCommand(args: string[]): void {
  if (args.length < 1) {
    console.error('Error: Missing presets option');
    console.log('Usage: swarm-builder presets [--list | --add=JSON | --delete=ID]');
    process.exit(1);
  }
  
  const option = args[0];
  const presetManager = new ModelPresetManager();
  
  if (option === '--list') {
    console.log('Listing model presets...');
    presetManager.getAllPresets().then(presets => {
      console.table(presets);
    }).catch(error => {
      console.error(`Error listing presets: ${error.message}`);
    });
  } else if (option.startsWith('--add=')) {
    const json = option.substring(6);
    try {
      const preset = JSON.parse(json);
      console.log(`Adding preset: ${preset.id}...`);
      presetManager.createPreset(preset).then(() => {
        console.log('Preset added successfully');
      }).catch(error => {
        console.error(`Error adding preset: ${error.message}`);
      });
    } catch (error) {
      console.error(`Error parsing preset JSON: ${error.message}`);
    }
  } else if (option.startsWith('--delete=')) {
    const id = option.substring(9);
    console.log(`Deleting preset: ${id}...`);
    presetManager.deletePreset(id).then(() => {
      console.log('Preset deleted successfully');
    }).catch(error => {
      console.error(`Error deleting preset: ${error.message}`);
    });
  } else {
    console.error(`Error: Unknown presets option: ${option}`);
    console.log('Usage: swarm-builder presets [--list | --add=JSON | --delete=ID]');
    process.exit(1);
  }
}

/**
 * Handle the servers command
 */
function handleServersCommand(args: string[]): void {
  if (args.length < 1) {
    console.error('Error: Missing servers option');
    console.log('Usage: swarm-builder servers [--list | --add=JSON | --delete=ID]');
    process.exit(1);
  }
  
  const option = args[0];
  const serverRegistry = new MCPServerRegistry();
  
  if (option === '--list') {
    console.log('Listing MCP servers...');
    console.table(serverRegistry.listServers());
  } else if (option.startsWith('--add=')) {
    const json = option.substring(6);
    try {
      const server = JSON.parse(json);
      console.log(`Adding MCP server: ${server.id}...`);
      serverRegistry.registerServer(server);
      console.log('Server added successfully');
    } catch (error) {
      console.error(`Error parsing server JSON: ${error.message}`);
    }
  } else if (option.startsWith('--delete=')) {
    const id = option.substring(9);
    console.log(`Deleting MCP server: ${id}...`);
    serverRegistry.unregisterServer(id);
    console.log('Server deleted successfully');
  } else {
    console.error(`Error: Unknown servers option: ${option}`);
    console.log('Usage: swarm-builder servers [--list | --add=JSON | --delete=ID]');
    process.exit(1);
  }
}

/**
 * Handle the UI command
 */
function handleUICommand(args: string[]): void {
  console.log('Starting Swarm-Builder UI...');
  // TODO: Implement UI startup logic
  // This would launch the Electron app
}

/**
 * Show the version
 */
function showVersion(): void {
  const packageJson = require('../../package.json');
  console.log(`Swarm-Builder v${packageJson.version}`);
}

/**
 * Show the help text
 */
function showHelp(): void {
  const packageJson = require('../../package.json');
  
  console.log(`Swarm-Builder v${packageJson.version}\n`);
  console.log('Usage: swarm-builder [command] [options]\n');
  console.log('Commands:');
  console.log('  create               Create a new swarm');
  console.log('  run <service-id>     Run a swarm service');
  console.log('  config [options]     Configure API keys and settings');
  console.log('  presets [options]    Manage model presets');
  console.log('  servers [options]    Manage MCP servers');
  console.log('  ui                   Start the Swarm-Builder UI');
  console.log('  --version, -v        Show version');
  console.log('  --help, -h           Show help');
  console.log('\nOptions:');
  console.log('  config:');
  console.log('    --set-anthropic-key=KEY   Set the Anthropic API key');
  console.log('    --set-openai-key=KEY      Set the OpenAI API key');
  console.log('    --edit                    Open config in editor');
  console.log('    --view                    View config');
  console.log('\n  presets:');
  console.log('    --list                     List model presets');
  console.log('    --add=JSON                 Add a model preset');
  console.log('    --delete=ID                Delete a model preset');
  console.log('\n  servers:');
  console.log('    --list                     List MCP servers');
  console.log('    --add=JSON                 Add an MCP server');
  console.log('    --delete=ID                Delete an MCP server');
}
