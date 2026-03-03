// Figma Page Analyzer Plugin
// Analyzes all nodes and provides comprehensive statistics

import {
  NodeStats,
  SerializedPaint,
  SerializedEffect,
  InspectedNodeData,
  DEFAULT_ANALYSIS_OPTIONS
} from './types';

// Helper function to convert color to hex
export function colorToHex(color: RGB | RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = 'a' in color ? color.a : 1;

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Extract colors from paint
export function extractColors(paints: readonly Paint[] | typeof figma.mixed, colorSet: Set<string>): void {
  if (paints === figma.mixed || !paints) return;

  paints.forEach(paint => {
    if (paint.type === 'SOLID' && paint.color) {
      colorSet.add(colorToHex(paint.color));
    } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
      paint.gradientStops?.forEach(stop => {
        colorSet.add(colorToHex(stop.color));
      });
    }
  });
}

// Serialize paint array for JSON
function serializePaints(paints: readonly Paint[] | typeof figma.mixed): SerializedPaint[] | string {
  if (paints === figma.mixed) return 'mixed';
  if (!paints) return [];

  return paints.map(paint => {
    if (paint.type === 'SOLID') {
      return {
        type: paint.type,
        color: colorToHex(paint.color),
        opacity: paint.opacity,
        visible: paint.visible
      };
    } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' ||
               paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
      return {
        type: paint.type,
        gradientStops: paint.gradientStops?.map(stop => ({
          color: colorToHex(stop.color),
          position: stop.position
        })),
        opacity: paint.opacity,
        visible: paint.visible
      };
    } else if (paint.type === 'IMAGE') {
      return {
        type: paint.type,
        scaleMode: paint.scaleMode,
        opacity: paint.opacity,
        visible: paint.visible
      };
    }
    return { type: paint.type };
  });
}

// Serialize effects for JSON
function serializeEffects(effects: readonly Effect[]): SerializedEffect[] {
  return effects.map(effect => ({
    type: effect.type,
    visible: effect.visible,
    radius: 'radius' in effect ? effect.radius : undefined,
    color: 'color' in effect ? colorToHex(effect.color) : undefined,
    offset: 'offset' in effect ? effect.offset : undefined,
    spread: 'spread' in effect ? effect.spread : undefined,
    blendMode: 'blendMode' in effect ? effect.blendMode : undefined
  }));
}

// Extract detailed properties from selected node with error handling
export function inspectSelectedNode(node: SceneNode): InspectedNodeData {
  const errors: string[] = [];

  try {
    const baseProps: InspectedNodeData = {
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible,
      locked: node.locked
    };

    // Opacity and blend mode
    try {
      if ('opacity' in node) baseProps.opacity = node.opacity;
      if ('blendMode' in node) baseProps.blendMode = node.blendMode;
    } catch (e) {
      errors.push('Failed to read opacity/blendMode');
    }

    // Position and dimensions
    try {
      if ('x' in node && 'y' in node) {
        baseProps.position = { x: node.x, y: node.y };
      }
    } catch (e) {
      baseProps.position = { error: 'Unable to read position' };
      errors.push('Failed to read position');
    }

    try {
      if ('width' in node && 'height' in node) {
        baseProps.dimensions = { width: node.width, height: node.height };
      }
    } catch (e) {
      baseProps.dimensions = { error: 'Unable to read dimensions' };
      errors.push('Failed to read dimensions');
    }

    try {
      if ('rotation' in node) {
        baseProps.rotation = node.rotation;
      }
    } catch (e) {
      errors.push('Failed to read rotation');
    }

    // Layout properties
    try {
      if ('layoutMode' in node && node.layoutMode !== 'NONE') {
        baseProps.autoLayout = {
          mode: node.layoutMode,
          primaryAxisSizingMode: node.primaryAxisSizingMode,
          counterAxisSizingMode: node.counterAxisSizingMode,
          primaryAxisAlignItems: node.primaryAxisAlignItems,
          counterAxisAlignItems: node.counterAxisAlignItems,
          paddingLeft: node.paddingLeft,
          paddingRight: node.paddingRight,
          paddingTop: node.paddingTop,
          paddingBottom: node.paddingBottom,
          itemSpacing: node.itemSpacing
        };
      }
    } catch (e) {
      baseProps.autoLayout = { error: 'Unable to read auto layout' };
      errors.push('Failed to read auto layout');
    }

    // Constraints
    try {
      if ('constraints' in node) {
        baseProps.constraints = node.constraints;
      }
    } catch (e) {
      baseProps.constraints = { error: 'Unable to read constraints' };
      errors.push('Failed to read constraints');
    }

    // Fills and strokes
    try {
      if ('fills' in node) {
        baseProps.fills = serializePaints(node.fills);
      }
    } catch (e) {
      baseProps.fills = { error: 'Unable to read fills' };
      errors.push('Failed to read fills');
    }

    try {
      if ('strokes' in node) {
        baseProps.strokes = serializePaints(node.strokes);
        baseProps.strokeWeight = 'strokeWeight' in node ? node.strokeWeight : undefined;
        baseProps.strokeAlign = 'strokeAlign' in node ? node.strokeAlign : undefined;
      }
    } catch (e) {
      baseProps.strokes = { error: 'Unable to read strokes' };
      errors.push('Failed to read strokes');
    }

    // Effects
    try {
      if ('effects' in node) {
        baseProps.effects = serializeEffects(node.effects);
      }
    } catch (e) {
      baseProps.effects = { error: 'Unable to read effects' };
      errors.push('Failed to read effects');
    }

    // Corner radius
    try {
      if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
        baseProps.cornerRadius = node.cornerRadius;
      }
    } catch (e) {
      errors.push('Failed to read corner radius');
    }

    // Text-specific properties
    try {
      if (node.type === 'TEXT') {
        baseProps.text = {
          characters: node.characters,
          fontSize: node.fontSize,
          fontName: node.fontName !== figma.mixed ? node.fontName : 'mixed',
          textAlignHorizontal: node.textAlignHorizontal,
          textAlignVertical: node.textAlignVertical,
          letterSpacing: node.letterSpacing,
          lineHeight: node.lineHeight,
          textCase: node.textCase,
          textDecoration: node.textDecoration
        };
      }
    } catch (e) {
      baseProps.text = { error: 'Unable to read text properties' };
      errors.push('Failed to read text properties');
    }

    // Component/Instance properties
    try {
      if (node.type === 'COMPONENT') {
        baseProps.component = {
          key: node.key,
          description: node.description
        };
      }
    } catch (e) {
      baseProps.component = { error: 'Unable to read component properties' };
      errors.push('Failed to read component properties');
    }

    try {
      if (node.type === 'INSTANCE') {
        baseProps.instance = {
          mainComponentId: node.mainComponent?.id,
          mainComponentName: node.mainComponent?.name,
          componentProperties: node.componentProperties
        };
      }
    } catch (e) {
      baseProps.instance = { error: 'Unable to read instance properties' };
      errors.push('Failed to read instance properties');
    }

    // Vector properties
    try {
      if (node.type === 'VECTOR' || node.type === 'STAR' || node.type === 'POLYGON') {
        baseProps.vector = {
          vectorPaths: 'vectorPaths' in node ? node.vectorPaths.length : 0,
          vectorNetwork: 'vectorNetwork' in node ? {
            vertices: node.vectorNetwork.vertices.length,
            segments: node.vectorNetwork.segments.length
          } : undefined
        };
      }
    } catch (e) {
      baseProps.vector = { error: 'Unable to read vector properties' };
      errors.push('Failed to read vector properties');
    }

    // Export settings
    try {
      if ('exportSettings' in node) {
        baseProps.exportSettings = node.exportSettings;
      }
    } catch (e) {
      errors.push('Failed to read export settings');
    }

    // Children count
    try {
      if ('children' in node) {
        baseProps.childrenCount = node.children.length;
      }
    } catch (e) {
      errors.push('Failed to read children count');
    }

    // Add errors array if any errors occurred
    if (errors.length > 0) {
      baseProps.errors = errors;
    }

    return baseProps;
  } catch (error) {
    // Catastrophic failure - return minimal data with safe property access
    let safeId = 'unknown';
    let safeName = 'unknown';
    let safeType = 'unknown';

    try { safeId = node.id; } catch (e) { /* ignore */ }
    try { safeName = node.name; } catch (e) { /* ignore */ }
    try { safeType = node.type; } catch (e) { /* ignore */ }

    return {
      id: safeId,
      name: safeName,
      type: safeType,
      errors: ['Critical error inspecting node: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
}

// Traverse node tree and collect statistics
export function analyzeNode(node: SceneNode, stats: NodeStats, depth: number = 0): void {
  stats.totalNodes++;

  // Update node type count
  stats.nodesByType[node.type] = (stats.nodesByType[node.type] || 0) + 1;

  // Update hierarchy stats
  stats.hierarchy.maxDepth = Math.max(stats.hierarchy.maxDepth, depth);
  stats.hierarchy.depthDistribution[depth] = (stats.hierarchy.depthDistribution[depth] || 0) + 1;

  // Component analysis
  if (node.type === 'COMPONENT') {
    stats.components.total++;
    stats.components.uniqueComponents.add(node.id);
  } else if (node.type === 'INSTANCE') {
    stats.components.instances++;
    if (node.mainComponent) {
      stats.components.uniqueComponents.add(node.mainComponent.id);
    }
  } else if (node.type === 'COMPONENT_SET') {
    stats.components.componentSets++;
  }

  // Text analysis with memory limits
  if (node.type === 'TEXT') {
    stats.text.totalTextNodes++;
    stats.text.totalCharacters += node.characters.length;

    // Only store first 100 text samples to prevent memory overflow
    if (stats.text.textContents.length < DEFAULT_ANALYSIS_OPTIONS.maxTextSamples) {
      // Truncate long text to 200 characters
      const truncated = node.characters.length > DEFAULT_ANALYSIS_OPTIONS.maxTextLength
        ? node.characters.substring(0, DEFAULT_ANALYSIS_OPTIONS.maxTextLength) + '...'
        : node.characters;
      stats.text.textContents.push(truncated);
    }

    // Font analysis
    const fontName = node.fontName;
    if (fontName !== figma.mixed) {
      stats.text.uniqueFonts.add(`${fontName.family} ${fontName.style}`);
    }

    // Text styles
    if (node.textStyleId && typeof node.textStyleId === 'string') {
      stats.styles.textStyles.add(node.textStyleId);
    }
  }

  // Color and style analysis for nodes with fills/strokes
  if ('fills' in node && node.fills) {
    extractColors(node.fills, stats.colors.fills);
    if ('fillStyleId' in node && node.fillStyleId && typeof node.fillStyleId === 'string') {
      stats.styles.fillStyles.add(node.fillStyleId);
    }
  }

  if ('strokes' in node && node.strokes) {
    extractColors(node.strokes, stats.colors.strokes);
    if ('strokeStyleId' in node && node.strokeStyleId && typeof node.strokeStyleId === 'string') {
      stats.styles.strokeStyles.add(node.strokeStyleId);
    }
  }

  if ('effects' in node && node.effects) {
    if ('effectStyleId' in node && node.effectStyleId && typeof node.effectStyleId === 'string') {
      stats.styles.effectStyles.add(node.effectStyleId);
    }
  }

  // Dimension analysis
  if ('width' in node && 'height' in node) {
    if (!stats.dimensions.largestNode ||
        (node.width * node.height) > (stats.dimensions.largestNode.width * stats.dimensions.largestNode.height)) {
      stats.dimensions.largestNode = {
        name: node.name,
        width: node.width,
        height: node.height
      };
    }
  }

  // Recursively analyze children
  if ('children' in node) {
    node.children.forEach(child => analyzeNode(child, stats, depth + 1));
  }
}

// Main analysis function
export function analyzePage(): void {
  try {
    const currentPage = figma.currentPage;

    if (!currentPage) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No page selected'
      });
      return;
    }

    const stats: NodeStats = {
      totalNodes: 0,
      nodesByType: {},
      components: {
        total: 0,
        instances: 0,
        componentSets: 0,
        uniqueComponents: new Set()
      },
      colors: {
        fills: new Set(),
        strokes: new Set(),
        total: 0
      },
      text: {
        totalTextNodes: 0,
        totalCharacters: 0,
        uniqueFonts: new Set(),
        textContents: []
      },
      styles: {
        textStyles: new Set(),
        fillStyles: new Set(),
        strokeStyles: new Set(),
        effectStyles: new Set()
      },
      hierarchy: {
        maxDepth: 0,
        avgDepth: 0,
        depthDistribution: {}
      },
      dimensions: {
        totalWidth: 0,
        totalHeight: 0,
        largestNode: null
      }
    };

    // Analyze all nodes on the page
    currentPage.children.forEach(child => analyzeNode(child, stats, 0));

    // Calculate average depth
    let totalDepth = 0;
    let nodeCount = 0;
    Object.entries(stats.hierarchy.depthDistribution).forEach(([depth, count]) => {
      totalDepth += parseInt(depth) * count;
      nodeCount += count;
    });
    stats.hierarchy.avgDepth = nodeCount > 0 ? totalDepth / nodeCount : 0;

    // Calculate total unique colors
    const allColors = new Set([...stats.colors.fills, ...stats.colors.strokes]);
    stats.colors.total = allColors.size;

    // Convert Sets to arrays for JSON serialization
    const result = {
      pageName: currentPage.name,
      totalNodes: stats.totalNodes,
      nodesByType: stats.nodesByType,
      components: {
        total: stats.components.total,
        instances: stats.components.instances,
        componentSets: stats.components.componentSets,
        uniqueComponents: stats.components.uniqueComponents.size
      },
      colors: {
        fills: Array.from(stats.colors.fills),
        strokes: Array.from(stats.colors.strokes),
        allColors: Array.from(allColors),
        total: stats.colors.total
      },
      text: {
        totalTextNodes: stats.text.totalTextNodes,
        totalCharacters: stats.text.totalCharacters,
        uniqueFonts: Array.from(stats.text.uniqueFonts),
        textContents: stats.text.textContents
      },
      styles: {
        textStyles: stats.styles.textStyles.size,
        fillStyles: stats.styles.fillStyles.size,
        strokeStyles: stats.styles.strokeStyles.size,
        effectStyles: stats.styles.effectStyles.size,
        total: stats.styles.textStyles.size + stats.styles.fillStyles.size +
               stats.styles.strokeStyles.size + stats.styles.effectStyles.size
      },
      hierarchy: {
        maxDepth: stats.hierarchy.maxDepth,
        avgDepth: parseFloat(stats.hierarchy.avgDepth.toFixed(2)),
        depthDistribution: stats.hierarchy.depthDistribution
      },
      dimensions: stats.dimensions
    };

    figma.ui.postMessage({
      type: 'analysis-complete',
      data: result
    });

  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Send selected node info to UI
function sendSelectionUpdate(): void {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'selection-update',
      data: null
    });
    return;
  }

  if (selection.length === 1) {
    const inspectedNode = inspectSelectedNode(selection[0]);
    figma.ui.postMessage({
      type: 'selection-update',
      data: inspectedNode
    });
  } else {
    // Multiple selection
    figma.ui.postMessage({
      type: 'selection-update',
      data: {
        type: 'MULTIPLE_SELECTION',
        count: selection.length,
        nodes: selection.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type
        }))
      }
    });
  }
}

// Initialize plugin (only runs in Figma environment)
export function initPlugin(): void {
  if (typeof figma !== 'undefined') {
    // Show UI
    figma.showUI(__html__, { width: 600, height: 700 });

    // Listen for selection changes
    const selectionHandler = () => {
      sendSelectionUpdate();
    };
    figma.on('selectionchange', selectionHandler);

    // Send initial selection state
    sendSelectionUpdate();

    // Handle messages from UI
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'analyze') {
        analyzePage();
      } else if (msg.type === 'close') {
        // Clean up selection listener before closing
        figma.off('selectionchange', selectionHandler);
        figma.closePlugin();
      }
    };
  }
}

// Auto-initialize if in Figma environment
if (typeof figma !== 'undefined') {
  initPlugin();
}
