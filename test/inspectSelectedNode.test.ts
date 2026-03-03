import { inspectSelectedNode } from '../code';
import { createMockNode, createMockColor, createMockSolidPaint } from './mocks';

describe('inspectSelectedNode', () => {
  test('extracts basic properties from node', () => {
    const node = createMockNode('RECTANGLE', {
      id: 'test-id',
      name: 'Test Rectangle',
      visible: true,
      locked: false
    });

    const result = inspectSelectedNode(node);

    expect(result.id).toBe('test-id');
    expect(result.name).toBe('Test Rectangle');
    expect(result.type).toBe('RECTANGLE');
    expect(result.visible).toBe(true);
    expect(result.locked).toBe(false);
  });

  test('extracts position and dimensions', () => {
    const node = createMockNode('RECTANGLE', {
      x: 100,
      y: 200,
      width: 300,
      height: 400
    });

    const result = inspectSelectedNode(node);

    expect(result.position).toEqual({ x: 100, y: 200 });
    expect(result.dimensions).toEqual({ width: 300, height: 400 });
  });

  test('extracts rotation', () => {
    const node = createMockNode('RECTANGLE', {
      rotation: 45
    });

    const result = inspectSelectedNode(node);

    expect(result.rotation).toBe(45);
  });

  test('extracts opacity and blend mode', () => {
    const node = createMockNode('RECTANGLE', {
      opacity: 0.5,
      blendMode: 'MULTIPLY'
    });

    const result = inspectSelectedNode(node);

    expect(result.opacity).toBe(0.5);
    expect(result.blendMode).toBe('MULTIPLY');
  });

  test('extracts auto layout properties', () => {
    const node = createMockNode('FRAME', {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'FIXED',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 5,
      paddingBottom: 5,
      itemSpacing: 8
    });

    const result = inspectSelectedNode(node);

    expect(result.autoLayout).toBeDefined();
    expect(result.autoLayout.mode).toBe('HORIZONTAL');
    expect(result.autoLayout.itemSpacing).toBe(8);
  });

  test('extracts constraints', () => {
    const node = createMockNode('RECTANGLE', {
      constraints: {
        horizontal: 'LEFT',
        vertical: 'TOP'
      }
    });

    const result = inspectSelectedNode(node);

    expect(result.constraints).toEqual({
      horizontal: 'LEFT',
      vertical: 'TOP'
    });
  });

  test('extracts fills', () => {
    const node = createMockNode('RECTANGLE', {
      fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
    });

    const result = inspectSelectedNode(node);

    expect(result.fills).toBeDefined();
    expect(Array.isArray(result.fills)).toBe(true);
    if (Array.isArray(result.fills)) {
      expect(result.fills[0].type).toBe('SOLID');
      expect(result.fills[0].color).toBe('#ff0000');
    }
  });

  test('extracts strokes', () => {
    const node = createMockNode('RECTANGLE', {
      strokes: [createMockSolidPaint(createMockColor(0, 255, 0))],
      strokeWeight: 2,
      strokeAlign: 'CENTER'
    });

    const result = inspectSelectedNode(node);

    expect(result.strokes).toBeDefined();
    expect(result.strokeWeight).toBe(2);
    expect(result.strokeAlign).toBe('CENTER');
  });

  test('extracts corner radius', () => {
    const node = createMockNode('RECTANGLE', {
      cornerRadius: 8
    });

    const result = inspectSelectedNode(node);

    expect(result.cornerRadius).toBe(8);
  });

  test('extracts text properties', () => {
    const node = createMockNode('TEXT', {
      characters: 'Hello World',
      fontSize: 16,
      fontName: { family: 'Inter', style: 'Bold' },
      textAlignHorizontal: 'CENTER',
      textAlignVertical: 'TOP'
    });

    const result = inspectSelectedNode(node);

    expect(result.text).toBeDefined();
    expect(result.text.characters).toBe('Hello World');
    expect(result.text.fontSize).toBe(16);
    expect(result.text.fontName).toEqual({ family: 'Inter', style: 'Bold' });
  });

  test('extracts component properties', () => {
    const node = createMockNode('COMPONENT', {
      key: 'component-key-123',
      description: 'Test component description'
    });

    const result = inspectSelectedNode(node);

    expect(result.component).toBeDefined();
    expect(result.component.key).toBe('component-key-123');
    expect(result.component.description).toBe('Test component description');
  });

  test('extracts instance properties', () => {
    const node = createMockNode('INSTANCE', {
      mainComponent: {
        id: 'main-component-id',
        name: 'Main Component'
      },
      componentProperties: {
        prop1: 'value1'
      }
    });

    const result = inspectSelectedNode(node);

    expect(result.instance).toBeDefined();
    expect(result.instance.mainComponentId).toBe('main-component-id');
    expect(result.instance.mainComponentName).toBe('Main Component');
  });

  test('extracts children count', () => {
    const node = createMockNode('FRAME', {
      children: [
        createMockNode('RECTANGLE'),
        createMockNode('TEXT')
      ]
    });

    const result = inspectSelectedNode(node);

    expect(result.childrenCount).toBe(2);
  });

  test('handles errors gracefully for position', () => {
    const node = createMockNode('RECTANGLE');
    // Simulate error by making x throw
    Object.defineProperty(node, 'x', {
      get() { throw new Error('Cannot read x'); }
    });

    const result = inspectSelectedNode(node);

    expect(result.position).toHaveProperty('error');
    expect(result.errors).toBeDefined();
    expect(result.errors).toContain('Failed to read position');
  });

  test('handles errors gracefully for fills', () => {
    const node = createMockNode('RECTANGLE');
    Object.defineProperty(node, 'fills', {
      get() { throw new Error('Cannot read fills'); }
    });

    const result = inspectSelectedNode(node);

    expect(result.fills).toHaveProperty('error');
    expect(result.errors).toBeDefined();
    expect(result.errors).toContain('Failed to read fills');
  });

  test('handles catastrophic failure', () => {
    const node = {
      get id() { throw new Error('Critical error'); },
      get name() { return 'Test'; },
      get type() { return 'RECTANGLE'; }
    } as any;

    const result = inspectSelectedNode(node);

    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toContain('Critical error');
    expect(result.id).toBe('unknown');
  });

  test('returns no errors array when all properties read successfully', () => {
    const node = createMockNode('RECTANGLE', {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });

    const result = inspectSelectedNode(node);

    expect(result.errors).toBeUndefined();
  });

  test('handles mixed font names', () => {
    const node = createMockNode('TEXT', {
      fontName: figma.mixed
    });

    const result = inspectSelectedNode(node);

    expect(result.text).toBeDefined();
    expect(result.text.fontName).toBe('mixed');
  });

  test('extracts vector properties', () => {
    const node = createMockNode('VECTOR', {
      vectorPaths: [{ data: 'M 0 0 L 100 100' }],
      vectorNetwork: {
        vertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        segments: [{ start: 0, end: 1 }]
      }
    });

    const result = inspectSelectedNode(node);

    expect(result.vector).toBeDefined();
    expect(result.vector.vectorPaths).toBe(1);
    expect(result.vector.vectorNetwork).toBeDefined();
    expect(result.vector.vectorNetwork.vertices).toBe(2);
    expect(result.vector.vectorNetwork.segments).toBe(1);
  });

  test('handles nodes without optional properties', () => {
    const node = createMockNode('GROUP', {
      id: 'group-id',
      name: 'Group',
      type: 'GROUP',
      visible: true,
      locked: false
    });

    const result = inspectSelectedNode(node);

    expect(result.id).toBe('group-id');
    expect(result.name).toBe('Group');
    expect(result.type).toBe('GROUP');
    // Should not have errors for missing optional properties
    expect(result.errors).toBeUndefined();
  });
});
