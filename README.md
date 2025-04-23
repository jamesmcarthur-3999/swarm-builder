# Swarm-Builder v0.2

## Overview

Swarm-Builder is a framework for creating and managing AI agent swarms with per-agent model selection. The core v0.2 feature allows users to configure each agent to run on a different LLM model preset (e.g., Claude 3.7 Sonnet for coding, GPT-4.1 Turbo for orchestration).

## Key Features

- **Per-Agent Model Selection**: Choose optimal LLM for each agent's role
- **Multi-Provider Support**: Integrate Anthropic and OpenAI models in the same swarm
- **Model Preset Management**: Create and customize model configurations
- **Cost Controls**: Monitor and limit expenditure per agent
- **Framework Flexibility**: Support for multiple agent frameworks (AutoGen, CrewAI, LangGraph, LangChain)
- **MCP Integration**: Native support for Anthropic's Model Context Protocol

## Documentation

- [Architecture](docs/ARCHITECTURE.md): System design and components
- [MCP Integration](docs/MCP_INTEGRATION.md): How MCP tools are integrated
- [Installation](docs/INSTALLATION.md): Setup and configuration
- [Usage Guide](docs/USAGE.md): How to use Swarm-Builder
- [API Reference](docs/API.md): Detailed API documentation

## Quick Start

```bash
# Install Swarm-Builder
npm install swarm-builder

# Configure your API keys
swarm-builder config --set-anthropic-key=YOUR_ANTHROPIC_KEY
swarm-builder config --set-openai-key=YOUR_OPENAI_KEY

# Create a new swarm with the wizard
swarm-builder create
```

## Supported Models

### Anthropic
- Claude 3.7 Sonnet: 128K output tokens, strong code generation and planning

### OpenAI
- GPT-4.1 Turbo (o3/o4): Improved reasoning, longer context, released April 2025

## License

MIT
