import { MCPTool, MCPToolFilter } from './index';

/**
 * Registry for MCP tools
 */
export class MCPToolRegistry {
  private tools: Map<string, MCPTool>;
  
  constructor() {
    this.tools = new Map();
  }
  
  /**
   * Register a tool
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.id, tool);
  }
  
  /**
   * Unregister a tool
   */
  unregisterTool(toolId: string): void {
    this.tools.delete(toolId);
  }
  
  /**
   * Get a tool by ID
   */
  getTool(toolId: string): MCPTool | null {
    return this.tools.get(toolId) || null;
  }
  
  /**
   * List tools
   */
  listTools(filter?: MCPToolFilter): MCPTool[] {
    let tools = Array.from(this.tools.values());
    
    if (filter) {
      // Filter by server ID
      if (filter.serverId) {
        tools = tools.filter(tool => tool.serverId === filter.serverId);
      }
      
      // Filter by category
      if (filter.category) {
        tools = tools.filter(tool => 
          tool.metadata?.category === filter.category
        );
      }
      
      // Filter by search term
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        tools = tools.filter(tool => 
          tool.name.toLowerCase().includes(searchTerm) ||
          tool.description.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    return tools;
  }
  
  /**
   * Search tools
   */
  searchTools(query: string): MCPTool[] {
    return this.listTools({ search: query });
  }
}