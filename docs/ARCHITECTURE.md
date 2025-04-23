# Swarm-Builder Architecture

## System Overview

Swarm-Builder is designed as a modular, extensible framework for creating and managing AI agent swarms with per-agent model selection capability. The architecture follows a layered approach to separate concerns and promote reusability.

## High-Level Architecture

```
┌─────────────────┐           ┌──────────────────┐          ┌────────────────────┐
│                 │           │                  │          │                    │
│  Frontend (UI)  │◄─────────►│  Core Services   │◄────────►│  LLM Providers     │
│  Electron App   │           │                  │          │  (Anthropic/OpenAI) │
│                 │           │                  │          │                    │
└─────────────────┘           └──────────────────┘          └────────────────────┘
                                      ▲                               ▲
                                      │                               │
                                      ▼                               │
                              ┌──────────────────┐                    │
                              │                  │                    │
                              │  Framework       │                    │
                              │  Adapters        │────────────────────┘
                              │                  │
                              └──────────────────┘
```

## Core Components

### 1. Frontend (Electron App)

The user interface is built using Electron, React, and TypeScript. It provides:

- **Service Wizard**: A step-by-step interface for creating and configuring agent swarms
- **Settings Manager**: Interface for API key and model preset management
- **Runtime Interface**: Visualization and interaction with running swarms
- **Model Picker**: UI for selecting models per agent with type-ahead search

### 2. Core Services

The core services provide the main functionality of the framework:

- **Orchestrator**: Manages agent interactions and communication
- **Model Manager**: Handles different LLM providers and model configurations
- **Service Manager**: Stores, validates, and loads service specifications
- **Cost Tracker**: Monitors and limits expenditure per agent

### 3. Framework Adapters

Adapters for different agent frameworks that translate Swarm-Builder's model selection to framework-specific configurations:

- **AutoGen Adapter**: For Microsoft's AutoGen framework
- **CrewAI Adapter**: For CrewAI framework
- **LangGraph Adapter**: For LangChain's LangGraph framework
- **LangChain Router Adapter**: For standard LangChain routers

### 4. Provider Integrations

Clients for different LLM providers:

- **Anthropic Client**: For Claude models
- **OpenAI Client**: For GPT models

## Data Models

### Model Preset

```typescript
interface ModelPreset {
  id: string;              // Unique identifier
  provider: string;        // "anthropic" or "openai"
  model: string;           // Specific model name
  temperature: number;     // Default: varies by model
  top_p: number;           // Default: varies by model
  max_tokens: number;      // Default: varies by model
  context_window?: number; // Optional metadata
  description?: string;    // Optional description
}
```

### Agent

```typescript
interface Agent {
  id: string;              // Unique identifier
  name: string;            // Display name
  role: string;            // Description of agent's role
  tools: string[];         // Allowed MCP tools
  model_preset_id: string; // Reference to model preset
  system_prompt?: string;  // Optional custom prompt
  max_cost?: number;       // Optional cost limit
}
```

### Service Specification

```typescript
interface ServiceSpec {
  id: string;              // Unique identifier
  name: string;            // Display name
  description?: string;    // Optional description
  agents: Agent[];         // List of agents
  orchestration: {         // Orchestration configuration
    type: string;          // Framework to use (autogen, crewai, langgraph, langchain)
    config: any;           // Framework-specific config
  };
  created_at: number;      // Creation timestamp
  updated_at: number;      // Last update timestamp
}
```

## Security & Cost Guardrails

- API keys are stored securely using the OS keychain/credential store
- Per-agent cost limits with automatic monitoring and halt if exceeded
- Double-billing warnings when mixing providers in the same loop

## Framework-Specific Adapters

### AutoGen Adapter

```javascript
// Example implementation pattern
class AutoGenAdapter {
  constructor(serviceSpec) {
    this.serviceSpec = serviceSpec;
    this.modelPresets = {}; // Will be populated with model presets
  }

  // Convert Swarm-Builder agent to AutoGen-compatible agent
  createAgent(agent) {
    const preset = this.modelPresets[agent.model_preset_id];
    
    // AutoGen-specific implementation
    return {
      name: agent.name,
      system_message: agent.role,
      llm_config: {
        model: preset.model,
        temperature: preset.temperature,
        max_tokens: preset.max_tokens,
        top_p: preset.top_p
      },
      tools: this.mapTools(agent.tools)
    };
  }

  // Create the entire swarm configuration
  createSwarm() {
    const agents = this.serviceSpec.agents.map(agent => this.createAgent(agent));
    // AutoGen-specific orchestration code
    return {
      agents,
      config: this.serviceSpec.orchestration.config
    };
  }
}
```

### CrewAI Adapter

```javascript
// Example implementation pattern
class CrewAIAdapter {
  constructor(serviceSpec) {
    this.serviceSpec = serviceSpec;
    this.modelPresets = {}; // Will be populated with model presets
  }

  // Convert Swarm-Builder agent to CrewAI-compatible agent
  createAgent(agent) {
    const preset = this.modelPresets[agent.model_preset_id];
    
    // CrewAI-specific implementation
    return {
      role: agent.name,
      goal: agent.role,
      backstory: agent.system_prompt || `You are a ${agent.name} who ${agent.role}`,
      llm_model: preset.model,
      tools: this.mapTools(agent.tools),
      verbose: true
    };
  }

  // Create the entire crew configuration
  createCrew() {
    const agents = this.serviceSpec.agents.map(agent => this.createAgent(agent));
    const tasks = this.serviceSpec.orchestration.config.tasks || [];
    
    // CrewAI-specific orchestration code
    return {
      agents,
      tasks,
      process: this.serviceSpec.orchestration.config.process || "sequential"
    };
  }
}
```

### LangGraph Adapter

```javascript
// Example implementation pattern
class LangGraphAdapter {
  constructor(serviceSpec) {
    this.serviceSpec = serviceSpec;
    this.modelPresets = {}; // Will be populated with model presets
  }

  // Convert Swarm-Builder agent to LangGraph-compatible node
  createNode(agent) {
    const preset = this.modelPresets[agent.model_preset_id];
    
    // LangGraph-specific implementation
    return {
      id: agent.id,
      node: {
        llm: {
          provider: preset.provider,
          model: preset.model,
          temperature: preset.temperature,
          max_tokens: preset.max_tokens,
          top_p: preset.top_p
        },
        prompt: agent.system_prompt || agent.role,
        tools: this.mapTools(agent.tools)
      }
    };
  }

  // Create the entire graph configuration
  createGraph() {
    const nodes = this.serviceSpec.agents.map(agent => this.createNode(agent));
    const edges = this.serviceSpec.orchestration.config.edges || [];
    
    // LangGraph-specific orchestration code
    return {
      nodes,
      edges
    };
  }
}
```

### LangChain Router Adapter

```javascript
// Example implementation pattern
class LangChainRouterAdapter {
  constructor(serviceSpec) {
    this.serviceSpec = serviceSpec;
    this.modelPresets = {}; // Will be populated with model presets
  }

  // Convert Swarm-Builder agent to LangChain-compatible agent
  createAgent(agent) {
    const preset = this.modelPresets[agent.model_preset_id];
    
    // LangChain-specific implementation
    return {
      id: agent.id,
      llm: {
        provider: preset.provider,
        model: preset.model,
        temperature: preset.temperature,
        max_tokens: preset.max_tokens,
        top_p: preset.top_p
      },
      prompt: agent.system_prompt || agent.role,
      tools: this.mapTools(agent.tools)
    };
  }

  // Create the router configuration
  createRouter() {
    const agents = this.serviceSpec.agents.reduce((acc, agent) => {
      acc[agent.id] = this.createAgent(agent);
      return acc;
    }, {});
    
    const router = {
      default_agent_id: this.serviceSpec.orchestration.config.router.default_agent_id,
      routes: this.serviceSpec.orchestration.config.router.routes
    };
    
    // LangChain-specific orchestration code
    return {
      agents,
      router
    };
  }
}
```

## Communication Flow

1. **User creates a service definition** through the Service Wizard, selecting models for each agent
2. **Orchestrator instantiates the agents** using the appropriate framework adapter
3. **Framework adapter translates** Swarm-Builder's model selections to framework-specific configurations
4. **Agents run with their selected models** via the provider integrations
5. **Orchestrator monitors cost** during execution and stops if limits are exceeded
