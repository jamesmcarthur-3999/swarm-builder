# MCP Integration in Swarm-Builder

## Overview

Swarm-Builder integrates with Anthropic's Model Context Protocol (MCP) to enable agents to interact with external data sources and tools. MCP provides a standardized way for AI models to connect with various systems through a client-server architecture.

## What is Model Context Protocol (MCP)?

MCP is an open protocol developed by Anthropic that standardizes how AI applications provide context to Large Language Models (LLMs). It creates a "USB-C port for AI" that allows models to connect to different data sources and tools through a standardized interface.

## MCP Architecture in Swarm-Builder

Swarm-Builder integrates MCP through a layered approach:

```
┌─────────────────┐           ┌──────────────────┐           ┌────────────────────┐
│                 │           │                  │           │                    │
│  Agent          │◄─────────►│  MCP Client      │◄─────────►│  MCP Servers       │
│                 │           │  Manager         │           │                    │
└─────────────────┘           └──────────────────┘           └────────────────────┘
                                      ▲                               ▲
                                      │                               │
                                      ▼                               │
                              ┌──────────────────┐                    │
                              │                  │                    │
                              │  MCP Registry    │────────────────────┘
                              │  & Permissions   │
                              └──────────────────┘
```

### Core Components

#### 1. MCP Client Manager

The MCP Client Manager handles connections to MCP servers and provides a unified interface for agents to access tools:

- Manages MCP server connections lifecycle
- Routes agent requests to appropriate servers
- Handles authentication and security
- Implements protocol-level error handling

#### 2. MCP Registry & Permissions

The Registry maintains information about available MCP servers and enforces access controls:

- Discovers and catalogs available MCP servers
- Maintains metadata about available tools and resources
- Enforces per-agent permissions for MCP tools
- Monitors usage for cost tracking and compliance

#### 3. Framework-Specific Adapters

Swarm-Builder provides adapters that translate between MCP and various agent frameworks:

- **AutoGen Adapter**: Exposes MCP tools as AutoGen functions
- **CrewAI Adapter**: Integrates MCP tools with CrewAI agents
- **LangGraph Adapter**: Makes MCP tools available to LangGraph nodes
- **LangChain Router Adapter**: Connects MCP to LangChain's routing system

## Model Selection with MCP

Swarm-Builder's unique feature is allowing per-agent model selection while maintaining full MCP compatibility:

1. **Model-Agnostic Design**: MCP works with any LLM that implements the protocol
2. **Per-Agent MCP Configuration**: Each agent can have its own MCP server connections
3. **Mixed-Provider Support**: Use Claude for some agents and GPT for others while sharing tools

## Implementation Example

```typescript
// Example of agent configuration with MCP tools
interface AgentMCPConfig {
  servers: string[];           // MCP server IDs
  tools: string[];             // Allowed MCP tools
  permissions: {               // Per-tool permissions
    [toolId: string]: {
      maxCallsPerSession?: number;
      maxCostPerSession?: number;
    }
  };
}

// Agent configuration with model preset and MCP config
const agent = swarmBuilder.createAgent({
  name: "Research-Agent",
  role: "Conducts in-depth research on topics",
  model_preset_id: "claude-sonnet-3.7",
  mcp: {
    servers: ["filesystem", "web-fetch", "brave-search"],
    tools: ["fetch", "readFile", "search"],
    permissions: {
      "search": { maxCallsPerSession: 10 }
    }
  }
});
```

## Integration with Frameworks

### AutoGen Integration

AutoGen has built-in support for MCP tools through the `mcp_server_tools` function. Swarm-Builder leverages this to seamlessly connect agents with their assigned models:

```python
# Swarm-Builder integration with AutoGen and MCP
from autogen import AssistantAgent
from autogen.agentchat.contrib.mcp_server_tools import mcp_server_tools

def create_autogen_agent(agent_config, model_preset):
    # Connect to MCP servers from agent config
    tools = mcp_server_tools(agent_config.mcp.servers)
    
    # Create AutoGen agent with the configured model
    return AssistantAgent(
        name=agent_config.name,
        system_message=agent_config.role,
        llm_config={
            "model": model_preset.model,
            "config_list": [{
                "model": model_preset.model,
                "api_key": get_api_key(model_preset.provider)
            }],
            "temperature": model_preset.temperature,
            "top_p": model_preset.top_p,
            "max_tokens": model_preset.max_tokens
        },
        tools=tools
    )
```

### CrewAI Integration

CrewAI is working on native MCP integration. In the meantime, Swarm-Builder provides an adapter:

```python
# Swarm-Builder integration with CrewAI and MCP
from crewai import Agent
from swarm_builder.adapters.crewai_mcp import mcp_tools_for_crewai

def create_crewai_agent(agent_config, model_preset):
    # Get MCP tools in CrewAI-compatible format
    tools = mcp_tools_for_crewai(agent_config.mcp.servers, agent_config.mcp.tools)
    
    # Create CrewAI agent with configured model
    return Agent(
        role=agent_config.name,
        goal=agent_config.role,
        backstory=f"You are {agent_config.name} who {agent_config.role}",
        llm_model=model_preset.model,
        tools=tools,
        verbose=True
    )
```

### LangGraph Integration

Swarm-Builder implements MCP tool integration for LangGraph through adapters:

```python
# Swarm-Builder integration with LangGraph and MCP
from langgraph.graph import StateGraph
from swarm_builder.adapters.langgraph_mcp import create_mcp_node

def create_langgraph_agent(agent_config, model_preset):
    # Create LangGraph with MCP tools
    builder = StateGraph()
    
    # Add node with MCP tools for this agent
    mcp_node = create_mcp_node(
        agent_config.mcp.servers, 
        agent_config.mcp.tools,
        model=model_preset.model,
        temperature=model_preset.temperature,
        max_tokens=model_preset.max_tokens
    )
    
    builder.add_node("agent", mcp_node)
    
    # Create the graph
    return builder.compile()
```

## Security Considerations

- **Isolation**: Each agent's MCP access is isolated from other agents
- **Least Privilege**: Agents only have access to the specific tools they need
- **Auditability**: All MCP tool calls are logged for tracking and debugging
- **Approval Flows**: Sensitive MCP actions require human approval
- **Credentials Management**: API keys for MCP servers are securely stored

## Supported MCP Servers

Swarm-Builder is compatible with a wide range of MCP servers from both official and community sources:

1. **File Operations**: Filesystem, Git, PDF/document readers
2. **Web Tools**: Brave Search, Web Fetch, Web Browse
3. **APIs & Integrations**: GitHub, Google Drive, Slack, databases
4. **Specialized Tools**: Code execution, image generation, data analysis

## Setting Up MCP in Swarm-Builder

To configure MCP for an agent swarm:

1. **Install MCP Servers**: Add desired MCP servers to your environment
2. **Register Servers**: Add server configurations to Swarm-Builder settings
3. **Configure Agents**: Specify which agents can access which MCP servers and tools
4. **Set Permissions**: Define access limits and security policies
5. **Validate**: Test permissions and access patterns

## References

For more information on MCP and its capabilities, refer to:

- [Anthropic MCP Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- [Model Context Protocol GitHub](https://github.com/modelcontextprotocol)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
