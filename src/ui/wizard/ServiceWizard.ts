/**
 * Service Wizard component for creating swarm services
 * 
 * This is a placeholder implementation. In a real implementation,
 * this would be a React component.
 */
export class ServiceWizard {
  private currentStep: number;
  private steps: string[];
  private serviceData: any;
  
  constructor() {
    this.currentStep = 0;
    this.steps = [
      'BasicInfo',
      'FrameworkSelection',
      'AgentConfiguration',
      'OrchestrationConfiguration',
      'Review'
    ];
    this.serviceData = {
      name: '',
      description: '',
      orchestration: {
        type: '',
        config: {}
      },
      agents: []
    };
  }
  
  /**
   * Move to the next step
   */
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }
  
  /**
   * Move to the previous step
   */
  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  
  /**
   * Get the current step
   */
  getCurrentStep(): string {
    return this.steps[this.currentStep];
  }
  
  /**
   * Update service data
   */
  updateServiceData(data: any): void {
    this.serviceData = { ...this.serviceData, ...data };
  }
  
  /**
   * Add an agent
   */
  addAgent(agent: any): void {
    this.serviceData.agents.push(agent);
  }
  
  /**
   * Get service data
   */
  getServiceData(): any {
    return this.serviceData;
  }
}