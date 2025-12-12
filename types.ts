export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  TEMPLATE_SELECTION = 'TEMPLATE_SELECTION',
  EDITOR = 'EDITOR',
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  headline: string;
  highlightWord: string;
  layoutDescription: string;
  colorPalette: string[]; // e.g., ["#000000", "#FFFFFF", "#00FFFF"]
  psychology: string;
  graphicElements: string[];
  bestUseCase: string;
  layoutType: 'split' | 'full-face' | 'minimal' | 'grid';
  suggestedBackground: string;
}

export interface AnalysisResult {
  templates: ThumbnailTemplate[];
  backgroundSuggestions: string[];
  critique: string;
}

export interface EditorState {
  headline: string;
  highlightWord: string;
  backgroundImageUrl: string | null;
  userImageUrl: string | null;
  selectedTemplate: ThumbnailTemplate | null;
  isBackgroundRemoved: boolean;
}