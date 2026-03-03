// Shared type definitions for Figma Page Analyzer

export interface NodeStats {
  totalNodes: number;
  nodesByType: Record<string, number>;
  components: {
    total: number;
    instances: number;
    componentSets: number;
    uniqueComponents: Set<string>;
  };
  colors: {
    fills: Set<string>;
    strokes: Set<string>;
    total: number;
  };
  text: {
    totalTextNodes: number;
    totalCharacters: number;
    uniqueFonts: Set<string>;
    textContents: string[];
  };
  styles: {
    textStyles: Set<string>;
    fillStyles: Set<string>;
    strokeStyles: Set<string>;
    effectStyles: Set<string>;
  };
  hierarchy: {
    maxDepth: number;
    avgDepth: number;
    depthDistribution: Record<number, number>;
  };
  dimensions: {
    totalWidth: number;
    totalHeight: number;
    largestNode: { name: string; width: number; height: number } | null;
  };
}

export interface SerializedPaint {
  type: string;
  color?: string;
  opacity?: number;
  visible?: boolean;
  gradientStops?: Array<{
    color: string;
    position: number;
  }>;
  scaleMode?: string;
}

export interface SerializedEffect {
  type: string;
  visible: boolean;
  radius?: number;
  color?: string;
  offset?: { x: number; y: number };
  spread?: number;
  blendMode?: string;
}

export interface InspectedNodeData {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blendMode?: string;
  position?: { x: number; y: number } | { error: string };
  dimensions?: { width: number; height: number } | { error: string };
  rotation?: number;
  autoLayout?: any | { error: string };
  constraints?: any | { error: string };
  fills?: SerializedPaint[] | string | { error: string };
  strokes?: SerializedPaint[] | string | { error: string };
  strokeWeight?: any;
  strokeAlign?: string;
  effects?: SerializedEffect[] | { error: string };
  cornerRadius?: number;
  text?: any | { error: string };
  component?: any | { error: string };
  instance?: any | { error: string };
  vector?: any | { error: string };
  exportSettings?: any;
  childrenCount?: number;
  errors?: string[];
}

export interface AnalysisOptions {
  maxTextSamples: number;
  maxTextLength: number;
}

export const DEFAULT_ANALYSIS_OPTIONS: AnalysisOptions = {
  maxTextSamples: 100,
  maxTextLength: 200
};
