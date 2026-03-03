import { analyzePage } from '../code';
import { createMockPage, createMockNode, createMockColor, createMockSolidPaint } from './mocks';

// Mock figma global
const mockFigma: any = {
  mixed: Symbol('mixed'),
  currentPage: null,
  ui: {
    postMessage: jest.fn()
  }
};

(global as any).figma = mockFigma;

describe('analyzePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFigma.ui.postMessage.mockClear();
  });

  test('sends error when no page is selected', () => {
    mockFigma.currentPage = null;

    analyzePage();

    expect(mockFigma.ui.postMessage).toHaveBeenCalledWith({
      type: 'error',
      message: 'No page selected'
    });
  });

  test('analyzes empty page', () => {
    mockFigma.currentPage = createMockPage([]);

    analyzePage();

    expect(mockFigma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'analysis-complete',
        data: expect.objectContaining({
          pageName: 'Test Page',
          totalNodes: 0
        })
      })
    );
  });

  test('analyzes page with single node', () => {
    const node = createMockNode('RECTANGLE');
    mockFigma.currentPage = createMockPage([node]);

    analyzePage();

    expect(mockFigma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'analysis-complete',
        data: expect.objectContaining({
          totalNodes: 1,
          nodesByType: expect.objectContaining({
            RECTANGLE: 1
          })
        })
      })
    );
  });

  test('analyzes page with multiple nodes', () => {
    const nodes = [
      createMockNode('RECTANGLE'),
      createMockNode('TEXT'),
      createMockNode('ELLIPSE')
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.type).toBe('analysis-complete');
    expect(call.data.totalNodes).toBe(3);
    expect(call.data.nodesByType.RECTANGLE).toBe(1);
    expect(call.data.nodesByType.TEXT).toBe(1);
    expect(call.data.nodesByType.ELLIPSE).toBe(1);
  });

  test('calculates hierarchy depth correctly', () => {
    const parent = createMockNode('FRAME', {
      children: [
        createMockNode('FRAME', {
          children: [
            createMockNode('RECTANGLE')
          ]
        })
      ]
    });
    mockFigma.currentPage = createMockPage([parent]);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.hierarchy.maxDepth).toBe(2);
  });

  test('counts components and instances', () => {
    const nodes = [
      createMockNode('COMPONENT'),
      createMockNode('INSTANCE'),
      createMockNode('INSTANCE')
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.components.total).toBe(1);
    expect(call.data.components.instances).toBe(2);
  });

  test('extracts and counts colors', () => {
    const nodes = [
      createMockNode('RECTANGLE', {
        fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
      }),
      createMockNode('RECTANGLE', {
        fills: [createMockSolidPaint(createMockColor(0, 255, 0))]
      })
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.colors.total).toBe(2);
    expect(call.data.colors.allColors).toContain('#ff0000');
    expect(call.data.colors.allColors).toContain('#00ff00');
  });

  test('analyzes text content', () => {
    const nodes = [
      createMockNode('TEXT', {
        characters: 'Hello',
        fontName: { family: 'Inter', style: 'Regular' }
      }),
      createMockNode('TEXT', {
        characters: 'World',
        fontName: { family: 'Roboto', style: 'Bold' }
      })
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.text.totalTextNodes).toBe(2);
    expect(call.data.text.totalCharacters).toBe(10);
    expect(call.data.text.uniqueFonts).toHaveLength(2);
  });

  test('finds largest node', () => {
    const nodes = [
      createMockNode('RECTANGLE', {
        name: 'Small',
        width: 50,
        height: 50
      }),
      createMockNode('RECTANGLE', {
        name: 'Large',
        width: 300,
        height: 200
      })
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.dimensions.largestNode.name).toBe('Large');
    expect(call.data.dimensions.largestNode.width).toBe(300);
    expect(call.data.dimensions.largestNode.height).toBe(200);
  });

  test('calculates average depth', () => {
    const nodes = [
      createMockNode('RECTANGLE'), // depth 0
      createMockNode('FRAME', {
        children: [
          createMockNode('RECTANGLE') // depth 1
        ]
      })
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.hierarchy.avgDepth).toBeGreaterThan(0);
    expect(call.data.hierarchy.avgDepth).toBeLessThan(1);
  });

  test('handles errors gracefully', () => {
    mockFigma.currentPage = {
      name: 'Test Page',
      children: null // This will cause an error
    };

    analyzePage();

    expect(mockFigma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: expect.any(String)
      })
    );
  });

  test('converts Sets to arrays in result', () => {
    const nodes = [
      createMockNode('TEXT', {
        fontName: { family: 'Inter', style: 'Regular' }
      })
    ];
    mockFigma.currentPage = createMockPage(nodes);

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(Array.isArray(call.data.text.uniqueFonts)).toBe(true);
    expect(Array.isArray(call.data.colors.allColors)).toBe(true);
  });

  test('includes page name in result', () => {
    mockFigma.currentPage = createMockPage([]);
    mockFigma.currentPage.name = 'My Custom Page';

    analyzePage();

    const call = mockFigma.ui.postMessage.mock.calls[0][0];
    expect(call.data.pageName).toBe('My Custom Page');
  });
});
