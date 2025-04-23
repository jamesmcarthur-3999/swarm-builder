import { ModelPreset } from '../../core/models';
import { ModelPresetManager } from '../../core/models/model-preset-manager';

/**
 * Model preset editor component
 * 
 * This is a placeholder implementation. In a real implementation,
 * this would be a React component.
 */
export class ModelPresetEditor {
  private modelPresetManager: ModelPresetManager;
  private currentPreset: ModelPreset | null;
  
  constructor() {
    this.modelPresetManager = new ModelPresetManager();
    this.currentPreset = null;
  }
  
  /**
   * Load a preset for editing
   */
  async loadPreset(presetId: string): Promise<void> {
    this.currentPreset = await this.modelPresetManager.getPreset(presetId);
  }
  
  /**
   * Create a new preset
   */
  createNewPreset(): void {
    this.currentPreset = {
      id: '',
      provider: '',
      model: '',
      temperature: 0.7,
      top_p: 1.0,
      max_tokens: 1024
    };
  }
  
  /**
   * Update the current preset
   */
  updatePreset(data: Partial<ModelPreset>): void {
    if (!this.currentPreset) {
      return;
    }
    
    this.currentPreset = { ...this.currentPreset, ...data };
  }
  
  /**
   * Save the current preset
   */
  async savePreset(): Promise<ModelPreset | null> {
    if (!this.currentPreset) {
      return null;
    }
    
    // Validate preset
    if (!this.currentPreset.id) {
      throw new Error('Preset ID is required');
    }
    
    if (!this.currentPreset.provider) {
      throw new Error('Provider is required');
    }
    
    if (!this.currentPreset.model) {
      throw new Error('Model is required');
    }
    
    // Save preset
    return await this.modelPresetManager.createPreset(this.currentPreset);
  }
  
  /**
   * Delete a preset
   */
  async deletePreset(presetId: string): Promise<void> {
    await this.modelPresetManager.deletePreset(presetId);
    
    if (this.currentPreset && this.currentPreset.id === presetId) {
      this.currentPreset = null;
    }
  }
  
  /**
   * Get all presets
   */
  async getAllPresets(): Promise<ModelPreset[]> {
    return await this.modelPresetManager.getAllPresets();
  }
  
  /**
   * Get the current preset
   */
  getCurrentPreset(): ModelPreset | null {
    return this.currentPreset;
  }
}