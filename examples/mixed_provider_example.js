/**
 * Example of using Swarm-Builder with mixed providers
 * 
 * This example demonstrates the core feature of Swarm-Builder:
 * using different LLM models for different agents in a swarm.
 */
const { SwarmBuilder } = require('swarm-builder');

async function main() {
  // Initialize SwarmBuilder
  const builder = new SwarmBuilder();

  // Create a new service specification
  const serviceSpec = builder.createServiceSpec({
    name: 'Mixed Provider Swarm',
    description: 'A swarm using both Claude and GPT models with MCP integration',
    orchestration: {
      type: 'autogen',
      config: {
        interactive: true
      }
    }
  });

  // Add a coding agent with Claude 3.7 Sonnet
  builder.addAgent(serviceSpec, {
    name: 'Coder',
    role: 'Writes code based on requirements',
    tools: ['fs', 'shell'],
    model_preset_id: 'claude-sonnet-3.7',
    mcp: {
      servers: ['filesystem', 'shell-execute'],
      tools: ['readFile', 'writeFile', 'executeCommand'],
      permissions: {
        'writeFile': { requireApproval: true },
        'executeCommand': { requireApproval: true }
      }
    }
  });

  // Add an orchestrator agent with GPT-4.1 Turbo
  builder.addAgent(serviceSpec, {
    name: 'Orchestrator',
    role: 'Breaks down tasks and coordinates work',
    tools: ['web_search'],
    model_preset_id: 'gpt-4.1-turbo',
    mcp: {
      servers: ['brave-search'],
      tools: ['search']
    }
  });

  // Add a review agent with Claude 3.7 Sonnet
  builder.addAgent(serviceSpec, {
    name: 'Reviewer',
    role: 'Reviews code for bugs and improvements',
    tools: ['fs'],
    model_preset_id: 'claude-sonnet-3.7',
    mcp: {
      servers: ['filesystem'],
      tools: ['readFile']
    }
  });

  // Save the service specification
  const savedSpec = await builder.saveServiceSpec(serviceSpec);
  console.log(`Created swarm with ID: ${savedSpec.id}`);

  // Run the swarm
  const { SwarmOrchestrator } = require('swarm-builder');
  const orchestrator = new SwarmOrchestrator(savedSpec.id);
  
  await orchestrator.start();
  console.log('Swarm started');

  // Example interaction
  const response = await orchestrator.sendMessage(
    'Create a simple React app that displays a list of movies from an API'
  );
  console.log(response);

  // Get metrics
  const metrics = orchestrator.getMetrics();
  console.log('Execution metrics:', metrics);

  // Stop the swarm
  await orchestrator.stop();
  console.log('Swarm stopped');
}

main().catch(console.error);
