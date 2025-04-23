/**
 * Agent configuration component for the Service Wizard
 * 
 * This is a placeholder implementation. In a real implementation,
 * this would be a React component.
 */
export class AgentConfig {
  private agentData: any;
  
  constructor() {
    this.agentData = {
      name: '',
      role: '',
      tools: [],
      model_preset_id: '',
      system_prompt: '',
      max_cost: null,
      mcp: {
        servers: [],
        tools: [],
        permissions: {}
      }
    };
  }
  
  /**
   * Update agent data
   */
  updateAgentData(data: any): void {
    this.agentData = { ...this.agentData, ...data };
  }
  
  /**
   * Add a tool
   */
  addTool(tool: string): void {
    if (!this.agentData.tools.includes(tool)) {
      this.agentData.tools.push(tool);
    }
  }
  
  /**
   * Remove a tool
   */
  removeTool(tool: string): void {
    this.agentData.tools = this.agentData.tools.filter(
      (t: string) => t !== tool
    );
  }
  
  /**
   * Add an MCP server
   */
  addMCPServer(server: string): void {
    if (!this.agentData.mcp.servers.includes(server)) {
      this.agentData.mcp.servers.push(server);
    }
  }
  
  /**
   * Remove an MCP server
   */
  removeMCPServer(server: string): void {
    this.agentData.mcp.servers = this.agentData.mcp.servers.filter(
      (s: string) => s !== server
    );
  }
  
  /**
   * Add an MCP tool
   */
  addMCPTool(tool: string): void {
    if (!this.agentData.mcp.tools.includes(tool)) {
      this.agentData.mcp.tools.push(tool);
    }
  }
  
  /**
   * Remove an MCP tool
   */
  removeMCPTool(tool: string): void {
    this.agentData.mcp.tools = this.agentData.mcp.tools.filter(
      (t: string) => t !== tool
    );
  }
  
  /**
   * Set MCP tool permissions
   */
  setMCPToolPermissions(tool: string, permissions: any): void {
    this.agentData.mcp.permissions[tool] = permissions;
  }
  
  /**
   * Get agent data
   */
  getAgentData(): any {
    return this.agentData;
  }
}