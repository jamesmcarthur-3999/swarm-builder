import { v4 as uuidv4 } from 'uuid';
import { ServiceSpec, Agent, ModelPreset } from './index';
import { ServiceSpecManager } from './service-spec-manager';
import { ModelPresetManager } from './model-preset-manager';

/**
 * Options for creating a new service specification
 */
export interface ServiceSpecOptions {
  name: string;
  description?: string;
  orchestration: {
    type: string;
    config: any;
  };
}

/**
 * Options for creating a new agent
 */
export interface AgentOptions {
  name: string;
  role: string;
  tools: string[];
  model_preset_id: string;
  system_prompt?: string;
  max_cost?: number;
  mcp?: {
    servers: string[];
    tools: string[];
    permissions?: Record<string, any>;
    defaultParameters?: Record<string, any>;
  };
}

/**
 * Main class for building and managing swarms
 */
export class SwarmBuilder {
  private serviceSpecManager: ServiceSpecManager;
  private modelPresetManager: ModelPresetManager;

  constructor() {
    this.serviceSpecManager = new ServiceSpecManager();
    this.modelPresetManager = new ModelPresetManager();
  }

  /**
   * Create a new service specification
   */
  createServiceSpec(options: ServiceSpecOptions): ServiceSpec {
    const now = Date.now();
    
    const spec: ServiceSpec = {
      id: uuidv4(),
      name: options.name,
      description: options.description,
      agents: [],
      orchestration: options.orchestration,
      created_at: now,
      updated_at: now
    };
    
    return spec;
  }

  /**
   * Add an agent to a service specification
   */
  addAgent(spec: ServiceSpec, options: AgentOptions): Agent {
    const agent: Agent = {
      id: uuidv4(),
      name: options.name,
      role: options.role,
      tools: options.tools,
      model_preset_id: options.model_preset_id,
      system_prompt: options.system_prompt,
      max_cost: options.max_cost,
      mcp: options.mcp
    };
    
    spec.agents.push(agent);
    spec.updated_at = Date.now();
    
    return agent;
  }

  /**
   * Save a service specification
   */
  async saveServiceSpec(spec: ServiceSpec): Promise<ServiceSpec> {
    return await this.serviceSpecManager.saveServiceSpec(spec);
  }

  /**
   * Load a service specification by ID
   */
  async loadServiceSpec(id: string): Promise<ServiceSpec | null> {
    return await this.serviceSpecManager.getServiceSpec(id);
  }

  /**
   * List all service specifications
   */
  async listServiceSpecs(): Promise<ServiceSpec[]> {
    return await this.serviceSpecManager.listServiceSpecs();
  }

  /**
   * Get a model preset by ID
   */
  async getModelPreset(id: string): Promise<ModelPreset | null> {
    return await this.modelPresetManager.getPreset(id);
  }

  /**
   * List all model presets
   */
  async listModelPresets(): Promise<ModelPreset[]> {
    return await this.modelPresetManager.getAllPresets();
  }
}
