// Model interfaces and classes for Swarm-Builder

/**
 * Represents a model preset configuration
 */
export interface ModelPreset {
  id: string;              // Unique identifier
  provider: string;        // "anthropic" or "openai"
  model: string;           // Specific model name
  temperature: number;     // Default: varies by model
  top_p: number;           // Default: varies by model
  max_tokens: number;      // Default: varies by model
  context_window?: number; // Optional metadata
  description?: string;    // Optional description
}

/**
 * Represents an agent within a swarm
 */
export interface Agent {
  id: string;              // Unique identifier
  name: string;            // Display name
  role: string;            // Description of agent's role
  tools: string[];         // Allowed MCP tools
  model_preset_id: string; // Reference to model preset
  system_prompt?: string;  // Optional custom prompt
  max_cost?: number;       // Optional cost limit
  mcp?: AgentMCPConfig;    // MCP configuration
}

/**
 * MCP configuration for an agent
 */
export interface AgentMCPConfig {
  servers: string[];           // MCP server IDs
  tools: string[];             // Allowed MCP tools
  permissions?: {              // Per-tool permissions
    [toolId: string]: {
      maxCallsPerSession?: number;
      maxCostPerSession?: number;
      requireApproval?: boolean;
    }
  };
  defaultParameters?: {        // Default tool parameters
    [toolId: string]: any;     // Default values for tool parameters
  };
}

/**
 * Defines a complete swarm service
 */
export interface ServiceSpec {
  id: string;              // Unique identifier
  name: string;            // Display name
  description?: string;    // Optional description
  agents: Agent[];         // List of agents
  orchestration: {         // Orchestration configuration
    type: string;          // Framework to use
    config: any;           // Framework-specific config
  };
  created_at: number;      // Creation timestamp
  updated_at: number;      // Last update timestamp
}

/**
 * API connection settings for a provider
 */
export interface ProviderConfig {
  provider: string;        // "anthropic" or "openai"
  api_key: string;         // Encrypted
  organization_id?: string; // Optional
  enabled: boolean;        // Whether this provider is enabled
}

// Re-export classes from separate files
export { SwarmBuilder } from './swarm-builder';
export { ServiceSpecManager } from './service-spec-manager';
export { ModelPresetManager } from './model-preset-manager';
