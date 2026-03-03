// Figma Page Analyzer Plugin
// Analyzes all nodes and provides comprehensive statistics

interface NodeStats {
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

// Show UI
figma.showUI(__html__, { width: 500, height: 600 });

// Helper function to convert color to hex
function colorToHex(color: RGB | RGBA): string {
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
function extractColors(paints: readonly Paint[] | typeof figma.mixed, colorSet: Set<string>): void {
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

// Traverse node tree and collect statistics
function analyzeNode(node: SceneNode, stats: NodeStats, depth: number = 0): void {
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

  // Text analysis
  if (node.type === 'TEXT') {
    stats.text.totalTextNodes++;
    stats.text.totalCharacters += node.characters.length;
    stats.text.textContents.push(node.characters);

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
function analyzePage(): void {
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

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'analyze') {
    analyzePage();
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
