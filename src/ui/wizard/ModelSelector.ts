import { ModelPreset } from '../../core/models';

/**
 * Model selector component for the Service Wizard
 * 
 * This is a placeholder implementation. In a real implementation,
 * this would be a React component.
 */
export class ModelSelector {
  private presets: ModelPreset[];
  private selectedPresetId: string | null;
  private searchQuery: string;
  
  constructor(presets: ModelPreset[]) {
    this.presets = presets;
    this.selectedPresetId = null;
    this.searchQuery = '';
  }
  
  /**
   * Set the list of model presets
   */
  setPresets(presets: ModelPreset[]): void {
    this.presets = presets;
  }
  
  /**
   * Update the search query
   */
  updateSearchQuery(query: string): void {
    this.searchQuery = query;
  }
  
  /**
   * Get filtered presets based on the search query
   */
  getFilteredPresets(): ModelPreset[] {
    if (!this.searchQuery) {
      return this.presets;
    }
    
    const query = this.searchQuery.toLowerCase();
    
    return this.presets.filter(preset => 
      preset.id.toLowerCase().includes(query) ||
      preset.provider.toLowerCase().includes(query) ||
      preset.model.toLowerCase().includes(query) ||
      (preset.description && preset.description.toLowerCase().includes(query))
    );
  }
  
  /**
   * Group presets by provider
   */
  getGroupedPresets(): { [provider: string]: ModelPreset[] } {
    const groupedPresets: { [provider: string]: ModelPreset[] } = {};
    
    const filteredPresets = this.getFilteredPresets();
    
    for (const preset of filteredPresets) {
      if (!groupedPresets[preset.provider]) {
        groupedPresets[preset.provider] = [];
      }
      
      groupedPresets[preset.provider].push(preset);
    }
    
    return groupedPresets;
  }
  
  /**
   * Select a preset
   */
  selectPreset(presetId: string): void {
    this.selectedPresetId = presetId;
  }
  
  /**
   * Get the selected preset
   */
  getSelectedPreset(): ModelPreset | null {
    if (!this.selectedPresetId) {
      return null;
    }
    
    return this.presets.find(preset => preset.id === this.selectedPresetId) || null;
  }
}