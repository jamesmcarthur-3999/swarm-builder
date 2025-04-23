import { Agent, ModelPreset } from '../core/models';
import { MCPClient, MCPTool } from '../core/mcp';

/**
 * Adapter for LangGraph framework
 */
export class LangGraphAdapter {
  private mcpClient: MCPClient;
  
  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }
  
  /**
   * Convert an MCP tool to a LangGraph-compatible tool
   */
  async convertTool(tool: MCPTool): Promise<any> {
    // In Python this would be formatted for LangGraph
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
      // This is a placeholder for the actual executor function in Python
      executor: async (args: any) => {
        try {
          const result = await this.mcpClient.executeTool(
            tool.id, 
            args
          );
          return result.data;
        } catch (error: any) {
          return { error: error.message };
        }
      }
    };
  }
  
  /**
   * Create LangGraph tools from MCP tools
   */
  async createLangGraphTools(toolIds: string[]): Promise<any[]> {
    const tools: any[] = [];
    
    for (const toolId of toolIds) {
      const tool = await this.mcpClient.getTool(toolId);
      if (tool) {
        tools.push(await this.convertTool(tool));
      }
    }
    
    return tools;
  }
  
  /**
   * Create LangGraph node code for an agent
   * 
   * This generates Python code that would create a LangGraph node
   */
  async createNodeCode(agent: Agent, modelPreset: ModelPreset): Promise<string> {
    // This is a template for the Python code that would be generated
    const pythonTemplate = `
# Node for agent: ${agent.name}
from langgraph.graph import StateGraph
from langchain_core.messages import AIMessage, HumanMessage
import json

# Create LLM with tools
llm = create_llm_with_tools(
    model="${modelPreset.model}",
    temperature=${modelPreset.temperature},
    top_p=${modelPreset.top_p},
    max_tokens=${modelPreset.max_tokens},
    tools=tools  # Tools would be passed in from the MCP client
)

# Define node function
async def ${agent.name.toLowerCase().replace(/\s+/g, '_')}_node(state):
    """LangGraph node for ${agent.name}"""
    messages = state.get("messages", [])
    
    # Add system message if not present
    if not any(m["role"] == "system" for m in messages):
        messages.insert(0, {
            "role": "system",
            "content": "${agent.system_prompt || agent.role}"
        })
    
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
`;

    return pythonTemplate;
  }
  
  /**
   * Create a description of the LangGraph node
   */
  async createNodeDescription(agent: Agent, modelPreset: ModelPreset): Promise<any> {
    // Get tools for this agent
    let tools: any[] = [];
    
    if (agent.mcp?.tools) {
      tools = await this.createLangGraphTools(agent.mcp.tools);
    }
    
    // Return a description of the node
    return {
      id: agent.name.toLowerCase().replace(/\s+/g, '_'),
      agent_id: agent.id,
      name: agent.name,
      role: agent.role,
      model: modelPreset.model,
      provider: modelPreset.provider,
      tools: tools.map(t => t.function.name),
      system_prompt: agent.system_prompt || agent.role,
      temperature: modelPreset.temperature,
      max_tokens: modelPreset.max_tokens
    };
  }
}