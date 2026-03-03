// Mock Figma API for testing
export const mockFigma = {
  mixed: Symbol('mixed'),
  currentPage: {
    name: 'Test Page',
    selection: [],
    children: []
  },
  ui: {
    postMessage: jest.fn()
  },
  showUI: jest.fn(),
  closePlugin: jest.fn(),
  on: jest.fn()
};

// Mock node factory
export function createMockNode(type: string, overrides: any = {}): any {
  const baseNode = {
    id: `node-${Math.random().toString(36).substr(2, 9)}`,
    name: `Mock ${type}`,
    type,
    visible: true,
    locked: false,
    ...overrides
  };

  // Add type-specific properties
  if (type === 'FRAME' || type === 'RECTANGLE' || type === 'ELLIPSE') {
    return {
      ...baseNode,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fills: [],
      strokes: [],
      effects: [],
      opacity: 1,
      blendMode: 'NORMAL',
      ...overrides
    };
  }

  if (type === 'TEXT') {
    return {
      ...baseNode,
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      characters: 'Test Text',
      fontSize: 16,
      fontName: { family: 'Inter', style: 'Regular' },
      textAlignHorizontal: 'LEFT',
      textAlignVertical: 'TOP',
      fills: [],
      strokes: [],
      effects: [],
      opacity: 1,
      blendMode: 'NORMAL',
      ...overrides
    };
  }

  if (type === 'COMPONENT') {
    return {
      ...baseNode,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      key: 'component-key',
      description: 'Test component',
      children: [],
      fills: [],
      strokes: [],
      effects: [],
      opacity: 1,
      blendMode: 'NORMAL',
      ...overrides
    };
  }

  if (type === 'INSTANCE') {
    return {
      ...baseNode,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      mainComponent: {
        id: 'component-id',
        name: 'Main Component'
      },
      componentProperties: {},
      fills: [],
      strokes: [],
      effects: [],
      opacity: 1,
      blendMode: 'NORMAL',
      ...overrides
    };
  }

  return baseNode;
}

// Mock color helper
export function createMockColor(r: number, g: number, b: number, a: number = 1): any {
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

// Mock paint helper
export function createMockSolidPaint(color: any): any {
  return {
    type: 'SOLID',
    color,
    opacity: 1,
    visible: true
  };
}

// Mock gradient paint helper
export function createMockGradientPaint(stops: any[]): any {
  return {
    type: 'GRADIENT_LINEAR',
    gradientStops: stops,
    opacity: 1,
    visible: true
  };
}

// Create a mock page with nodes
export function createMockPage(nodes: any[]): any {
  return {
    name: 'Test Page',
    children: nodes,
    selection: []
  };
}

// Create a nested node structure for hierarchy testing
export function createNestedStructure(depth: number, childrenPerLevel: number = 2): any {
  if (depth === 0) {
    return createMockNode('RECTANGLE', { name: `Leaf Node` });
  }

  const children = [];
  for (let i = 0; i < childrenPerLevel; i++) {
    children.push(createNestedStructure(depth - 1, childrenPerLevel));
  }

  return createMockNode('FRAME', {
    name: `Frame Depth ${depth}`,
    children
  });
}
