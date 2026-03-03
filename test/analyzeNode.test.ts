import { analyzeNode } from '../code';
import { NodeStats } from '../types';
import { createMockNode, createMockColor, createMockSolidPaint, createNestedStructure } from './mocks';

function createEmptyStats(): NodeStats {
  return {
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
}

describe('analyzeNode', () => {
  test('counts single node correctly', () => {
    const stats = createEmptyStats();
    const node = createMockNode('RECTANGLE');

    analyzeNode(node, stats, 0);

    expect(stats.totalNodes).toBe(1);
    expect(stats.nodesByType['RECTANGLE']).toBe(1);
  });

  test('tracks hierarchy depth', () => {
    const stats = createEmptyStats();
    const node = createMockNode('FRAME');

    analyzeNode(node, stats, 3);

    expect(stats.hierarchy.maxDepth).toBe(3);
    expect(stats.hierarchy.depthDistribution[3]).toBe(1);
  });

  test('counts component nodes', () => {
    const stats = createEmptyStats();
    const node = createMockNode('COMPONENT');

    analyzeNode(node, stats, 0);

    expect(stats.components.total).toBe(1);
    expect(stats.components.uniqueComponents.size).toBe(1);
  });

  test('counts instance nodes', () => {
    const stats = createEmptyStats();
    const node = createMockNode('INSTANCE');

    analyzeNode(node, stats, 0);

    expect(stats.components.instances).toBe(1);
    expect(stats.components.uniqueComponents.size).toBe(1);
  });

  test('analyzes text nodes', () => {
    const stats = createEmptyStats();
    const node = createMockNode('TEXT', {
      characters: 'Hello World',
      fontName: { family: 'Inter', style: 'Bold' }
    });

    analyzeNode(node, stats, 0);

    expect(stats.text.totalTextNodes).toBe(1);
    expect(stats.text.totalCharacters).toBe(11);
    expect(stats.text.textContents).toContain('Hello World');
    expect(stats.text.uniqueFonts.has('Inter Bold')).toBe(true);
  });

  test('extracts fill colors', () => {
    const stats = createEmptyStats();
    const node = createMockNode('RECTANGLE', {
      fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
    });

    analyzeNode(node, stats, 0);

    expect(stats.colors.fills.has('#ff0000')).toBe(true);
  });

  test('extracts stroke colors', () => {
    const stats = createEmptyStats();
    const node = createMockNode('RECTANGLE', {
      strokes: [createMockSolidPaint(createMockColor(0, 255, 0))]
    });

    analyzeNode(node, stats, 0);

    expect(stats.colors.strokes.has('#00ff00')).toBe(true);
  });

  test('tracks largest node', () => {
    const stats = createEmptyStats();
    const smallNode = createMockNode('RECTANGLE', {
      name: 'Small',
      width: 50,
      height: 50
    });
    const largeNode = createMockNode('RECTANGLE', {
      name: 'Large',
      width: 200,
      height: 200
    });

    analyzeNode(smallNode, stats, 0);
    analyzeNode(largeNode, stats, 0);

    expect(stats.dimensions.largestNode?.name).toBe('Large');
    expect(stats.dimensions.largestNode?.width).toBe(200);
    expect(stats.dimensions.largestNode?.height).toBe(200);
  });

  test('recursively analyzes children', () => {
    const stats = createEmptyStats();
    const parent = createMockNode('FRAME', {
      children: [
        createMockNode('RECTANGLE'),
        createMockNode('TEXT')
      ]
    });

    analyzeNode(parent, stats, 0);

    expect(stats.totalNodes).toBe(3);
    expect(stats.nodesByType['FRAME']).toBe(1);
    expect(stats.nodesByType['RECTANGLE']).toBe(1);
    expect(stats.nodesByType['TEXT']).toBe(1);
  });

  test('handles deep nested structures', () => {
    const stats = createEmptyStats();
    const deepStructure = createNestedStructure(5, 2);

    analyzeNode(deepStructure, stats, 0);

    expect(stats.hierarchy.maxDepth).toBeGreaterThan(0);
    expect(stats.totalNodes).toBeGreaterThan(1);
  });

  test('counts multiple node types correctly', () => {
    const stats = createEmptyStats();
    const nodes = [
      createMockNode('RECTANGLE'),
      createMockNode('RECTANGLE'),
      createMockNode('TEXT'),
      createMockNode('ELLIPSE')
    ];

    nodes.forEach(node => analyzeNode(node, stats, 0));

    expect(stats.nodesByType['RECTANGLE']).toBe(2);
    expect(stats.nodesByType['TEXT']).toBe(1);
    expect(stats.nodesByType['ELLIPSE']).toBe(1);
    expect(stats.totalNodes).toBe(4);
  });

  test('handles nodes without fills or strokes', () => {
    const stats = createEmptyStats();
    const node = createMockNode('GROUP', {
      children: []
    });

    expect(() => analyzeNode(node, stats, 0)).not.toThrow();
    expect(stats.totalNodes).toBe(1);
  });

  test('tracks component sets', () => {
    const stats = createEmptyStats();
    const node = createMockNode('COMPONENT_SET');

    analyzeNode(node, stats, 0);

    expect(stats.components.componentSets).toBe(1);
  });

  test('limits text content samples to 100', () => {
    const stats = createEmptyStats();

    // Add 150 text nodes
    for (let i = 0; i < 150; i++) {
      const node = createMockNode('TEXT', {
        characters: `Text ${i}`
      });
      analyzeNode(node, stats, 0);
    }

    expect(stats.text.totalTextNodes).toBe(150);
    expect(stats.text.textContents.length).toBe(100); // Should be limited to 100
  });

  test('truncates long text content to 200 characters', () => {
    const stats = createEmptyStats();
    const longText = 'a'.repeat(300);
    const node = createMockNode('TEXT', {
      characters: longText
    });

    analyzeNode(node, stats, 0);

    expect(stats.text.totalCharacters).toBe(300);
    expect(stats.text.textContents[0].length).toBe(203); // 200 + '...'
    expect(stats.text.textContents[0].endsWith('...')).toBe(true);
  });

  test('does not truncate short text content', () => {
    const stats = createEmptyStats();
    const shortText = 'Short text';
    const node = createMockNode('TEXT', {
      characters: shortText
    });

    analyzeNode(node, stats, 0);

    expect(stats.text.textContents[0]).toBe(shortText);
    expect(stats.text.textContents[0].endsWith('...')).toBe(false);
  });
});
