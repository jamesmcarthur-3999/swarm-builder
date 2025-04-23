import { Agent, ModelPreset } from '../core/models';
import { MCPClient, MCPTool } from '../core/mcp';

/**
 * Adapter for AutoGen framework
 */
export class AutoGenAdapter {
  private mcpClient: MCPClient;
  
  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }
  
  /**
   * Convert an MCP tool to an AutoGen-compatible tool
   */
  async convertTool(tool: MCPTool): Promise<any> {
    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      async function(params: any): Promise<any> {
        try {
          const result = await this.mcpClient.executeTool(
            tool.id, 
            params
          );
          return { result: result.data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    };
  }
  
  /**
   * Create AutoGen tools from MCP tools
   */
  async createAutoGenTools(toolIds: string[]): Promise<any[]> {
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
   * Create an AutoGen agent
   */
  async createAgent(agent: Agent, modelPreset: ModelPreset): Promise<any> {
    // Get tools for this agent
    let tools: any[] = [];
    
    if (agent.mcp?.tools) {
      tools = await this.createAutoGenTools(agent.mcp.tools);
    }
    
    // Create AutoGen config
    return {
      name: agent.name,
      system_message: agent.role,
      llm_config: {
        model: modelPreset.model,
        config_list: [{
          model: modelPreset.model,
          api_key: '<API_KEY>',  // This would be filled in at runtime
          api_base: modelPreset.provider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.openai.com'
        }],
        temperature: modelPreset.temperature,
        top_p: modelPreset.top_p,
        max_tokens: modelPreset.max_tokens
      },
      tools: tools
    };
  }
}
