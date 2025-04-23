# MCP Server Integration Technical Specification

## Overview

This document specifies the technical implementation details for integrating MCP (Model Context Protocol) servers with Swarm-Builder, enabling agents to leverage external tools and data sources through a standardized interface.

## MCP Client Implementation

### Client Architecture

The MCP client in Swarm-Builder follows a modular design that supports connecting to multiple MCP servers simultaneously:

```typescript
interface MCPClientOptions {
  timeout?: number;         // Request timeout in ms
  maxRetries?: number;      // Max retry attempts
  retryDelay?: number;      // Delay between retries
  logging?: boolean;        // Enable verbose logging
  authentication?: {        // Authentication options
    type: 'basic' | 'token' | 'oauth';
    credentials: any;
  };
}

class MCPClient {
  private servers: Map<string, MCPServerConnection>;
  private toolRegistry: MCPToolRegistry;
  
  constructor(options?: MCPClientOptions) { /* ... */ }
  
  // Connect to an MCP server
  async connectServer(
    serverId: string, 
    endpoint: string,
    options?: MCPServerConnectionOptions
  ): Promise<void>;
  
  // Disconnect from an MCP server
  async disconnectServer(serverId: string): Promise<void>;
  
  // List available tools from connected servers
  async listTools(serverId?: string): Promise<MCPTool[]>;
  
  // Get a specific tool
  async getTool(toolId: string): Promise<MCPTool | null>;
  
  // Execute a tool
  async executeTool(
    toolId: string, 
    params: any, 
    context?: any
  ): Promise<MCPToolResult>;
}
```

### Server Connection Management

Swarm-Builder manages connections to MCP servers through a dedicated connection manager:

```typescript
interface MCPServerConnectionOptions {
  transport: 'websocket' | 'http' | 'stdio';
  timeout?: number;
  keepAlive?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
}

class MCPServerConnection {
  private endpoint: string;
  private transport: MCPTransport;
  private capabilities: MCPServerCapabilities;
  private status: ConnectionStatus;
  
  constructor(
    endpoint: string, 
    options: MCPServerConnectionOptions
  ) { /* ... */ }
  
  // Connect to the server
  async connect(): Promise<void>;
  
  // Disconnect from the server
  async disconnect(): Promise<void>;
  
  // Get server capabilities
  async getCapabilities(): Promise<MCPServerCapabilities>;
  
  // Execute a tool request
  async executeTool(
    toolId: string, 
    params: any, 
    context?: any
  ): Promise<MCPToolResult>;
}
```

### Tool Registry

The tool registry maintains information about available MCP tools:

```typescript
interface MCPTool {
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

class MCPToolRegistry {
  private tools: Map<string, MCPTool>;
  
  // Register a tool
  registerTool(tool: MCPTool): void;
  
  // Unregister a tool
  unregisterTool(toolId: string): void;
  
  // Get a tool
  getTool(toolId: string): MCPTool | null;
  
  // List tools
  listTools(filter?: MCPToolFilter): MCPTool[];
  
  // Search tools
  searchTools(query: string): MCPTool[];
}
```

## Per-Agent MCP Configuration

Each agent in Swarm-Builder can have its own MCP configuration with specific server and tool access:

```typescript
interface AgentMCPConfig {
  servers: string[];                    // Server IDs to connect to
  tools: string[];                      // Allowed tool IDs
  permissions: {                        // Per-tool permissions
    [toolId: string]: {
      maxCallsPerSession?: number;      // Max calls per session
      maxCostPerSession?: number;       // Max cost per session
      requireApproval?: boolean;        // Require user approval
    }
  };
  defaultParameters?: {                 // Default tool parameters
    [toolId: string]: any;              // Default values for tool parameters
  };
}
```

## Framework Adapters

### AutoGen Adapter

The AutoGen adapter translates MCP tools into AutoGen-compatible functions:

```typescript
import type { 
  BaseTool, 
  ToolParameters, 
  ToolCallResult 
} from 'autogen';

class MCPToolAdapter implements BaseTool {
  name: string;
  description: string;
  parameters: ToolParameters;
  
  private mcpClient: MCPClient;
  private toolId: string;
  
  constructor(
    mcpClient: MCPClient, 
    tool: MCPTool
  ) { /* ... */ }
  
  async call(
    parameters: Record<string, any>
  ): Promise<ToolCallResult> {
    try {
      const result = await this.mcpClient.executeTool(
        this.toolId, 
        parameters
      );
      return { result: result.data };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Function to convert MCP tools to AutoGen tools
function createAutoGenTools(
  mcpClient: MCPClient, 
  toolIds: string[]
): BaseTool[] {
  const tools: BaseTool[] = [];
  
  for (const toolId of toolIds) {
    const tool = mcpClient.getTool(toolId);
    if (tool) {
      tools.push(new MCPToolAdapter(mcpClient, tool));
    }
  }
  
  return tools;
}
```

### CrewAI Adapter

The CrewAI adapter converts MCP tools into CrewAI-compatible tools:

```python
from crewai import Tool
from typing import Dict, Any, List

class MCPToolCrewAIAdapter:
    def __init__(self, mcp_client, tool_id: str):
        self.mcp_client = mcp_client
        self.tool_id = tool_id
        self.tool_info = mcp_client.get_tool(tool_id)
        
    def to_crewai_tool(self) -> Tool:
        """Convert MCP tool to CrewAI tool"""
        return Tool(
            name=self.tool_info.name,
            description=self.tool_info.description,
            func=self._execute_tool
        )
        
    async def _execute_tool(self, **kwargs) -> str:
        """Execute the MCP tool"""
        try:
            result = await self.mcp_client.execute_tool(
                self.tool_id, 
                params=kwargs
            )
            return result.data
        except Exception as e:
            return f"Error executing tool: {str(e)}"
            
def create_crewai_tools(
    mcp_client, 
    tool_ids: List[str]
) -> List[Tool]:
    """Create CrewAI tools from MCP tools"""
    tools = []
    
    for tool_id in tool_ids:
        adapter = MCPToolCrewAIAdapter(mcp_client, tool_id)
        tools.append(adapter.to_crewai_tool())
        
    return tools
```

### LangGraph Adapter

The LangGraph adapter integrates MCP tools with LangGraph nodes:

```python
from langgraph.graph import StateGraph
from typing import Dict, Any, List, Callable

def create_mcp_node(
    mcp_client,
    tool_ids: List[str],
    model: str,
    **model_params
) -> Callable:
    """Create a LangGraph node with MCP tools"""
    
    # Get tools from MCP client
    tools = []
    for tool_id in tool_ids:
        tool = mcp_client.get_tool(tool_id)
        if tool:
            tools.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters,
                }
            })
    
    # Create LLM with tools
    llm = create_llm_with_tools(model, tools, **model_params)
    
    # Define node function
    async def mcp_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """LangGraph node that uses MCP tools"""
        messages = state.get("messages", [])
        
        # Call LLM with tools
        response = await llm.ainvoke(messages=messages)
        
        # Handle tool calls
        if "tool_calls" in response:
            for tool_call in response["tool_calls"]:
                tool_id = tool_call["id"]
                function = tool_call["function"]
                
                # Execute MCP tool
                try:
                    result = await mcp_client.execute_tool(
                        function["name"],
                        json.loads(function["arguments"])
                    )
                    
                    # Add tool result to messages
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_id,
                        "content": json.dumps(result.data),
                    })
                except Exception as e:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_id,
                        "content": f"Error: {str(e)}",
                    })
                    
            # Call LLM again with tool results
            final_response = await llm.ainvoke(messages=messages)
            return {"messages": messages + [final_response]}
        
        return {"messages": messages + [response]}
    
    return mcp_node
```

## Security Implementation

### Permission Enforcement

Swarm-Builder implements a permission system for MCP tools:

```typescript
interface MCPPermissionOptions {
  requireApproval?: boolean;      // Require user approval
  maxCallsPerSession?: number;    // Max calls per session
  maxCostPerSession?: number;     // Max cost per session
  allowedParameters?: string[];   // Allowed parameters (others filtered)
}

class MCPPermissionManager {
  private permissions: Map<string, Map<string, MCPPermissionOptions>>;
  private callCounts: Map<string, Map<string, number>>;
  private costTracking: Map<string, Map<string, number>>;
  
  // Check if agent has permission to use tool
  checkPermission(
    agentId: string, 
    toolId: string, 
    params?: any
  ): PermissionCheckResult;
  
  // Record tool usage
  recordToolUsage(
    agentId: string, 
    toolId: string, 
    cost?: number
  ): void;
  
  // Reset session counters
  resetSession(agentId: string): void;
}
```

### Approval Flow

For tools requiring approval, Swarm-Builder implements an approval flow:

```typescript
interface MCPApprovalOptions {
  timeout?: number;          // Approval timeout in ms
  autoApproveParams?: any;   // Parameters that don't need approval
  defaultResponse?: any;     // Default response if approval times out
}

class MCPApprovalManager {
  // Request approval for tool execution
  async requestApproval(
    agentId: string,
    toolId: string,
    params: any,
    options?: MCPApprovalOptions
  ): Promise<boolean>;
}
```

## MCP Server Configuration

Swarm-Builder stores MCP server configurations in a central registry:

```typescript
interface MCPServerConfig {
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

class MCPServerRegistry {
  // Get server configuration
  getServerConfig(serverId: string): MCPServerConfig | null;
  
  // Register server
  registerServer(config: MCPServerConfig): void;
  
  // Unregister server
  unregisterServer(serverId: string): void;
  
  // List available servers
  listServers(): MCPServerConfig[];
}
```

## Implementation Considerations

1. **Error Handling**: Implement robust error handling for MCP connections, including timeout and retry logic.

2. **Logging**: Provide detailed logging for MCP operations, useful for debugging and auditing.

3. **Caching**: Implement capability caching to reduce unnecessary round-trips to MCP servers.

4. **Rate Limiting**: Enforce rate limits to prevent abuse and manage costs.

5. **Server Management**: Implement lifecycle management for local MCP servers.

6. **Testing**: Create a mock MCP server for testing agent interactions without real MCP servers.

## Planned Timeline

1. **Phase 1 (2 weeks)**: Implement basic MCP client and server connection management
2. **Phase 2 (1 week)**: Implement tool registry and permission system
3. **Phase 3 (2 weeks)**: Develop framework adapters for AutoGen, CrewAI, and LangGraph
4. **Phase 4 (1 week)**: Add security features including permission enforcement and approval flows
5. **Phase 5 (1 week)**: Testing and documentation
