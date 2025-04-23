// Orchestrator components for Swarm-Builder

export interface SwarmMetrics {
  execution_time: number;
  tokens_used: {
    [agentId: string]: {
      input: number;
      output: number;
      total: number;
    };
  };
  cost: {
    [agentId: string]: number;
    total: number;
  };
}

export enum SwarmEvent {
  START = 'start',
  STOP = 'stop',
  MESSAGE = 'message',
  AGENT_START = 'agent:start',
  AGENT_STOP = 'agent:stop',
  AGENT_MESSAGE = 'agent:message',
  AGENT_ERROR = 'agent:error',
  COST_LIMIT_EXCEEDED = 'cost:limit_exceeded',
  ERROR = 'error'
}

// Re-export components
export { SwarmOrchestrator } from './swarm-orchestrator';
export { FrameworkFactory } from './framework-factory';
