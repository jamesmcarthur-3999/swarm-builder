/**
 * Example of using Swarm-Builder with CrewAI
 */
const { SwarmBuilder } = require('swarm-builder');

async function main() {
  // Initialize SwarmBuilder
  const builder = new SwarmBuilder();

  // Create a new service specification
  const serviceSpec = builder.createServiceSpec({
    name: 'Research Crew',
    description: 'CrewAI swarm for research and report writing',
    orchestration: {
      type: 'crewai',
      config: {
        process: 'sequential',
        verbose: true
      }
    }
  });

  // Add a researcher agent with Claude
  builder.addAgent(serviceSpec, {
    name: 'Researcher',
    role: 'Conducts in-depth research on topics',
    tools: ['web_search', 'web_fetch'],
    model_preset_id: 'claude-sonnet-3.7',
    mcp: {
      servers: ['brave-search', 'web-fetch'],
      tools: ['search', 'fetch']
    }
  });

  // Add an analyst agent with GPT
  builder.addAgent(serviceSpec, {
    name: 'Analyst',
    role: 'Analyzes research findings and identifies key insights',
    tools: [],
    model_preset_id: 'gpt-4.1-turbo'
  });

  // Add a writer agent with Claude
  builder.addAgent(serviceSpec, {
    name: 'Writer',
    role: 'Writes comprehensive reports based on research and analysis',
    tools: ['fs'],
    model_preset_id: 'claude-sonnet-3.7',
    mcp: {
      servers: ['filesystem'],
      tools: ['writeFile']
    }
  });

  // Add tasks for the crew
  serviceSpec.orchestration.config.tasks = [
    {
      agent_id: serviceSpec.agents[0].id, // Researcher
      description: 'Research the impact of AI on healthcare',
      expected_output: 'Comprehensive research findings on AI in healthcare',
    },
    {
      agent_id: serviceSpec.agents[1].id, // Analyst
      description: 'Analyze the research findings and identify key trends and insights',
      expected_output: 'Analysis of key trends and insights',
      dependencies: [0] // Depends on the researcher task
    },
    {
      agent_id: serviceSpec.agents[2].id, // Writer
      description: 'Write a comprehensive report on AI in healthcare based on the research and analysis',
      expected_output: 'Comprehensive report on AI in healthcare',
      dependencies: [1] // Depends on the analyst task
    }
  ];

  // Save the service specification
  const savedSpec = await builder.saveServiceSpec(serviceSpec);
  console.log(`Created swarm with ID: ${savedSpec.id}`);

  // Run the swarm
  const { SwarmOrchestrator } = require('swarm-builder');
  const orchestrator = new SwarmOrchestrator(savedSpec.id);
  
  await orchestrator.start();
  console.log('Swarm started');

  // Example interaction
  const response = await orchestrator.sendMessage('Start the research on AI in healthcare');
  console.log(response);

  // Get metrics
  const metrics = orchestrator.getMetrics();
  console.log('Execution metrics:', metrics);

  // Stop the swarm
  await orchestrator.stop();
  console.log('Swarm stopped');
}

main().catch(console.error);
