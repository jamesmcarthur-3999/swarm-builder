// MCP Client and interfaces

/**
 * Options for the MCP client
 */
export interface MCPClientOptions {
  timeout?: number;         // Request timeout in ms
  maxRetries?: number;      // Max retry attempts
  retryDelay?: number;      // Delay between retries
  logging?: boolean;        // Enable verbose logging
  authentication?: {        // Authentication options
    type: 'basic' | 'token' | 'oauth';
    credentials: any;
  };
}

/**
 * Options for MCP server connections
 */
export interface MCPServerConnectionOptions {
  transport: 'websocket' | 'http' | 'stdio';
  timeout?: number;
  keepAlive?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  id: string;                // Globally unique tool ID
  serverId: string;          // ID of the server providing the tool
  name: string;              // Tool name
  description: string;       // Tool description
  parameters: {              // Parameters schema
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  returns: {                 // Return value schema
    type: string;
    properties?: Record<string, any>;
  };
  metadata?: {               // Additional metadata
    category?: string;
    version?: string;
    permissions?: string[];
    costEstimate?: string;
  };
}

/**
 * Result of an MCP tool execution
 */
export interface MCPToolResult {
  data: any;                 // Result data
  metadata?: {               // Result metadata
    cost?: number;           // Cost of execution
    latency?: number;        // Execution time in ms
    timestamp?: number;      // Execution timestamp
  };
}

/**
 * Connection status for an MCP server
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * Filter for listing MCP tools
 */
export interface MCPToolFilter {
  serverId?: string;         // Filter by server ID
  category?: string;         // Filter by category
  search?: string;           // Search term
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  allowed: boolean;          // Whether the operation is allowed
  reason?: string;           // Reason if not allowed
  requiresApproval?: boolean; // Whether approval is required
}

/**
 * MCP server configuration
 */
export interface MCPServerConfig {
  id: string;                // Server ID
  name?: string;             // Display name
  description?: string;      // Description
  endpoint: string;          // Server endpoint
  transport: 'websocket' | 'http' | 'stdio';
  authentication?: {         // Authentication settings
    type: 'basic' | 'token' | 'oauth';
    credentials: any;
  };
  spawn?: {                  // For local servers
    command: string;         // Command to spawn server
    args?: string[];         // Command arguments
    env?: Record<string, string>; // Environment variables
  };
  options?: {                // Connection options
    timeout?: number;
    reconnect?: boolean;
    maxReconnectAttempts?: number;
  };
}

// Export classes from separate files
export { MCPClient } from './mcp-client';
export { MCPServerConnection } from './mcp-server-connection';
export { MCPToolRegistry } from './mcp-tool-registry';
export { MCPPermissionManager } from './mcp-permission-manager';
export { MCPServerRegistry } from './mcp-server-registry';
