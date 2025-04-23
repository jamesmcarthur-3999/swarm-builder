import { Agent, ModelPreset } from '../core/models';
import { MCPClient, MCPTool } from '../core/mcp';

/**
 * Adapter for CrewAI framework
 */
export class CrewAIAdapter {
  private mcpClient: MCPClient;
  
  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }
  
  /**
   * Convert an MCP tool to a CrewAI-compatible tool
   */
  async convertTool(tool: MCPTool): Promise<any> {
    // In Python this would be a Tool object
    return {
      name: tool.name,
      description: tool.description,
      metadata: tool.metadata,
      async function(...args: any[]): Promise<any> {
        try {
          // Parse arguments based on tool parameters
          const params: Record<string, any> = {};
          const paramNames = Object.keys(tool.parameters.properties);
          
          for (let i = 0; i < paramNames.length && i < args.length; i++) {
            params[paramNames[i]] = args[i];
          }
          
          const result = await this.mcpClient.executeTool(
            tool.id, 
            params
          );
          
          return result.data;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      }
    };
  }
  
  /**
   * Create CrewAI tools from MCP tools
   */
  async createCrewAITools(toolIds: string[]): Promise<any[]> {
    const tools: any[] = [];
    
    for (const toolId of toolIds) {
      const tool = await this.mcpClient.getTool(toolId);
      if (tool) {
        tools.push(await this.convertTool(tool));
      }
    }
    
    return tools;
  }
  
  /**
   * Create a CrewAI agent
   */
  async createAgent(agent: Agent, modelPreset: ModelPreset): Promise<any> {
    // Get tools for this agent
    let tools: any[] = [];
    
    if (agent.mcp?.tools) {
      tools = await this.createCrewAITools(agent.mcp.tools);
    }
    
    // Create CrewAI agent config
    // This would be translated to Python code when generating a CrewAI script
    return {
      role: agent.name,
      goal: agent.role,
      backstory: agent.system_prompt || `You are a ${agent.name} who ${agent.role}`,
      llm_model: modelPreset.model,
      provider: modelPreset.provider,
      temperature: modelPreset.temperature,
      top_p: modelPreset.top_p,
      max_tokens: modelPreset.max_tokens,
      tools: tools,
      verbose: true
    };
  }
}