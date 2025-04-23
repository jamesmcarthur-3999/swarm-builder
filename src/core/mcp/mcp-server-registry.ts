import { MCPServerConfig } from './index';

/**
 * Registry for MCP server configurations
 */
export class MCPServerRegistry {
  private servers: Map<string, MCPServerConfig>;
  
  constructor() {
    this.servers = new Map();
  }
  
  /**
   * Get a server configuration by ID
   */
  getServerConfig(serverId: string): MCPServerConfig | null {
    return this.servers.get(serverId) || null;
  }
  
  /**
   * Register a server configuration
   */
  registerServer(config: MCPServerConfig): void {
    this.servers.set(config.id, config);
  }
  
  /**
   * Unregister a server configuration
   */
  unregisterServer(serverId: string): void {
    this.servers.delete(serverId);
  }
  
  /**
   * List all server configurations
   */
  listServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }
}