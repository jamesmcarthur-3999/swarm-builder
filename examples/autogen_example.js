/**
 * Example of using Swarm-Builder with AutoGen
 */
const { SwarmBuilder } = require('swarm-builder');

async function main() {
  // Initialize SwarmBuilder
  const builder = new SwarmBuilder();

  // Create a new service specification
  const serviceSpec = builder.createServiceSpec({
    name: 'AutoGen Example',
    description: 'Simple AutoGen swarm with two agents',
    orchestration: {
      type: 'autogen',
      config: {
        interactive: true
      }
    }
  });

  // Add a user proxy agent with Claude
  builder.addAgent(serviceSpec, {
    name: 'User-Proxy',
    role: 'Represents the user and can execute code',
    tools: ['fs', 'shell'],
    model_preset_id: 'claude-sonnet-3.7',
    mcp: {
      servers: ['filesystem', 'web-fetch'],
      tools: ['readFile', 'writeFile', 'fetch'],
      permissions: {
        'writeFile': { requireApproval: true }
      }
    }
  });

  // Add an assistant agent with GPT
  builder.addAgent(serviceSpec, {
    name: 'Assistant',
    role: 'Helps the user solve problems and generate code',
    tools: ['web_search'],
    model_preset_id: 'gpt-4.1-turbo',
    mcp: {
      servers: ['brave-search'],
      tools: ['search']
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
  const response = await orchestrator.sendMessage('Create a simple web server in Python');
  console.log(response);

  // Get metrics
  const metrics = orchestrator.getMetrics();
  console.log('Execution metrics:', metrics);

  // Stop the swarm
  await orchestrator.stop();
  console.log('Swarm stopped');
}

main().catch(console.error);
