import { PermissionCheckResult } from './index';

export interface MCPPermissionOptions {
  requireApproval?: boolean;      // Require user approval
  maxCallsPerSession?: number;    // Max calls per session
  maxCostPerSession?: number;     // Max cost per session
  allowedParameters?: string[];   // Allowed parameters (others filtered)
}

/**
 * Manager for MCP tool permissions
 */
export class MCPPermissionManager {
  private permissions: Map<string, Map<string, MCPPermissionOptions>>;
  private callCounts: Map<string, Map<string, number>>;
  private costTracking: Map<string, Map<string, number>>;
  
  constructor() {
    this.permissions = new Map();
    this.callCounts = new Map();
    this.costTracking = new Map();
  }
  
  /**
   * Set permissions for an agent and tool
   */
  setPermission(
    agentId: string,
    toolId: string,
    options: MCPPermissionOptions
  ): void {
    // Get or create agent permissions map
    if (!this.permissions.has(agentId)) {
      this.permissions.set(agentId, new Map());
    }
    
    const agentPermissions = this.permissions.get(agentId)!;
    agentPermissions.set(toolId, options);
  }
  
  /**
   * Check if an agent has permission to use a tool
   */
  checkPermission(
    agentId: string,
    toolId: string,
    params?: any
  ): PermissionCheckResult {
    // Get agent permissions
    const agentPermissions = this.permissions.get(agentId);
    if (!agentPermissions) {
      return { allowed: false, reason: 'Agent does not have any permissions' };
    }
    
    // Get tool permissions
    const toolPermissions = agentPermissions.get(toolId);
    if (!toolPermissions) {
      return { allowed: false, reason: 'Agent does not have permission for this tool' };
    }
    
    // Check call count limit
    if (toolPermissions.maxCallsPerSession) {
      const callCount = this.getCallCount(agentId, toolId);
      if (callCount >= toolPermissions.maxCallsPerSession) {
        return { 
          allowed: false, 
          reason: `Call limit exceeded (${callCount}/${toolPermissions.maxCallsPerSession})` 
        };
      }
    }
    
    // Check cost limit
    if (toolPermissions.maxCostPerSession) {
      const cost = this.getCost(agentId, toolId);
      if (cost >= toolPermissions.maxCostPerSession) {
        return { 
          allowed: false, 
          reason: `Cost limit exceeded ($${cost.toFixed(2)}/$${toolPermissions.maxCostPerSession.toFixed(2)})` 
        };
      }
    }
    
    // Check allowed parameters
    if (params && toolPermissions.allowedParameters) {
      const paramKeys = Object.keys(params);
      const invalidParams = paramKeys.filter(
        key => !toolPermissions.allowedParameters!.includes(key)
      );
      
      if (invalidParams.length > 0) {
        return { 
          allowed: false, 
          reason: `Invalid parameters: ${invalidParams.join(', ')}` 
        };
      }
    }
    
    // Check if approval is required
    if (toolPermissions.requireApproval) {
      return { 
        allowed: true, 
        requiresApproval: true 
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Record tool usage
   */
  recordToolUsage(
    agentId: string,
    toolId: string,
    cost?: number
  ): void {
    // Record call count
    if (!this.callCounts.has(agentId)) {
      this.callCounts.set(agentId, new Map());
    }
    
    const agentCallCounts = this.callCounts.get(agentId)!;
    const currentCount = agentCallCounts.get(toolId) || 0;
    agentCallCounts.set(toolId, currentCount + 1);
    
    // Record cost
    if (cost) {
      if (!this.costTracking.has(agentId)) {
        this.costTracking.set(agentId, new Map());
      }
      
      const agentCosts = this.costTracking.get(agentId)!;
      const currentCost = agentCosts.get(toolId) || 0;
      agentCosts.set(toolId, currentCost + cost);
    }
  }
  
  /**
   * Get the call count for an agent and tool
   */
  private getCallCount(agentId: string, toolId: string): number {
    const agentCallCounts = this.callCounts.get(agentId);
    if (!agentCallCounts) return 0;
    
    return agentCallCounts.get(toolId) || 0;
  }
  
  /**
   * Get the total cost for an agent and tool
   */
  private getCost(agentId: string, toolId: string): number {
    const agentCosts = this.costTracking.get(agentId);
    if (!agentCosts) return 0;
    
    return agentCosts.get(toolId) || 0;
  }
  
  /**
   * Reset session counters for an agent
   */
  resetSession(agentId: string): void {
    this.callCounts.delete(agentId);
    this.costTracking.delete(agentId);
  }
}