import { Agent, ModelPreset } from '../core/models';
import { MCPClient, MCPTool } from '../core/mcp';

/**
 * Adapter for LangChain framework
 */
export class LangChainAdapter {
  private mcpClient: MCPClient;
  
  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }
  
  /**
   * Convert an MCP tool to a LangChain-compatible tool
   */
  async convertTool(tool: MCPTool): Promise<any> {
    return {
      name: tool.name,
      description: tool.description,
      schema: tool.parameters,
      async func(args: any): Promise<any> {
        try {
          const result = await this.mcpClient.executeTool(
            tool.id, 
            args
          );
          return result.data;
        } catch (error: any) {
          return { error: error.message };
        }
      }
    };
  }
  
  /**
   * Create LangChain tools from MCP tools
   */
  async createLangChainTools(toolIds: string[]): Promise<any[]> {
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
   * Create LangChain router configuration
   */
  async createRouterConfig(agents: Agent[], modelPresets: Record<string, ModelPreset>): Promise<any> {
    // Map agents by ID for easy lookup
    const agentMap: Record<string, any> = {};
    
    for (const agent of agents) {
      const preset = modelPresets[agent.model_preset_id];
      if (!preset) continue;
      
      let tools: any[] = [];
      if (agent.mcp?.tools) {
        tools = await this.createLangChainTools(agent.mcp.tools);
      }
      
      agentMap[agent.id] = {
        id: agent.id,
        name: agent.name,
        llm: {
          provider: preset.provider,
          model: preset.model,
          temperature: preset.temperature,
          max_tokens: preset.max_tokens,
          top_p: preset.top_p
        },
        prompt: agent.system_prompt || agent.role,
        tools: tools
      };
    }
    
    // Find the first agent (or a default agent)
    const defaultAgentId = agents.length > 0 ? agents[0].id : null;
    
    // Create router config
    return {
      agents: agentMap,
      router: {
        default_agent_id: defaultAgentId,
        routes: []
      }
    };
  }
  
  /**
   * Add a route to the router configuration
   */
  addRoute(routerConfig: any, pattern: string, agentId: string): void {
    if (!routerConfig.router) return;
    
    routerConfig.router.routes.push({
      pattern,
      agent_id: agentId
    });
  }
}