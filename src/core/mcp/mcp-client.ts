import { MCPClientOptions, MCPTool, MCPToolResult, MCPToolFilter } from './index';
import { MCPServerConnection } from './mcp-server-connection';
import { MCPToolRegistry } from './mcp-tool-registry';

/**
 * Main client for interacting with MCP servers
 */
export class MCPClient {
  private servers: Map<string, MCPServerConnection>;
  private toolRegistry: MCPToolRegistry;
  private options: MCPClientOptions;
  
  /**
   * Create a new MCP client
   */
  constructor(options?: MCPClientOptions) {
    this.servers = new Map();
    this.toolRegistry = new MCPToolRegistry();
    this.options = options || {};
  }
  
  /**
   * Connect to an MCP server
   */
  async connectServer(
    serverId: string, 
    endpoint: string,
    options?: any
  ): Promise<void> {
    if (this.servers.has(serverId)) {
      throw new Error(`Server with ID ${serverId} already exists`);
    }
    
    const connection = new MCPServerConnection(endpoint, options);
    await connection.connect();
    
    this.servers.set(serverId, connection);
    
    // Register tools from this server
    const capabilities = await connection.getCapabilities();
    if (capabilities.tools) {
      for (const tool of capabilities.tools) {
        this.toolRegistry.registerTool({
          ...tool,
          serverId,
          id: `${serverId}:${tool.name}`
        });
      }
    }
  }
  
  /**
   * Disconnect from an MCP server
   */
  async disconnectServer(serverId: string): Promise<void> {
    const connection = this.servers.get(serverId);
    if (!connection) {
      throw new Error(`Server with ID ${serverId} not found`);
    }
    
    await connection.disconnect();
    this.servers.delete(serverId);
    
    // Unregister tools from this server
    const tools = this.toolRegistry.listTools({ serverId });
    for (const tool of tools) {
      this.toolRegistry.unregisterTool(tool.id);
    }
  }
  
  /**
   * List available tools from connected servers
   */
  async listTools(filter?: MCPToolFilter): Promise<MCPTool[]> {
    return this.toolRegistry.listTools(filter);
  }
  
  /**
   * Get a specific tool
   */
  async getTool(toolId: string): Promise<MCPTool | null> {
    return this.toolRegistry.getTool(toolId);
  }
  
  /**
   * Execute a tool
   */
  async executeTool(
    toolId: string, 
    params: any, 
    context?: any
  ): Promise<MCPToolResult> {
    const tool = this.toolRegistry.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool with ID ${toolId} not found`);
    }
    
    const connection = this.servers.get(tool.serverId);
    if (!connection) {
      throw new Error(`Server for tool ${toolId} not connected`);
    }
    
    return await connection.executeTool(tool.name, params, context);
  }
}
