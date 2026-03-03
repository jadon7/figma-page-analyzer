/**
 * Integration tests for the Figma Page Analyzer plugin
 * Tests the complete workflow from analysis to UI updates
 */

import { analyzePage } from '../code';
import { createMockPage, createMockNode, createMockColor, createMockSolidPaint, createNestedStructure } from './mocks';

const mockFigma: any = {
  mixed: Symbol('mixed'),
  currentPage: null,
  ui: {
    postMessage: jest.fn()
  },
  showUI: jest.fn(),
  closePlugin: jest.fn(),
  on: jest.fn()
};

(global as any).figma = mockFigma;

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Page Analysis Workflow', () => {
    test('analyzes complex page with mixed content', () => {
      const complexPage = createMockPage([
        createMockNode('FRAME', {
          name: 'Header',
          children: [
            createMockNode('TEXT', {
              characters: 'Welcome',
              fontName: { family: 'Inter', style: 'Bold' }
            }),
            createMockNode('RECTANGLE', {
              fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
            })
          ]
        }),
        createMockNode('COMPONENT', {
          name: 'Button',
          children: [
            createMockNode('TEXT', {
              characters: 'Click me',
              fontName: { family: 'Roboto', style: 'Regular' }
            })
          ]
        }),
        createMockNode('INSTANCE', {
          name: 'Button Instance'
        })
      ]);

      mockFigma.currentPage = complexPage;
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.type).toBe('analysis-complete');
      expect(result.data.totalNodes).toBe(6);
      expect(result.data.components.total).toBe(1);
      expect(result.data.components.instances).toBe(1);
      expect(result.data.text.totalTextNodes).toBe(2);
      expect(result.data.colors.total).toBeGreaterThan(0);
    });

    test('handles large page with many nodes', () => {
      const nodes = [];
      for (let i = 0; i < 100; i++) {
        nodes.push(createMockNode('RECTANGLE', {
          name: `Node ${i}`,
          fills: [createMockSolidPaint(createMockColor(i % 255, 100, 150))]
        }));
      }

      mockFigma.currentPage = createMockPage(nodes);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.type).toBe('analysis-complete');
      expect(result.data.totalNodes).toBe(100);
      expect(result.data.nodesByType.RECTANGLE).toBe(100);
    });

    test('analyzes deeply nested hierarchy', () => {
      const deepStructure = createNestedStructure(10, 2);
      mockFigma.currentPage = createMockPage([deepStructure]);

      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.type).toBe('analysis-complete');
      expect(result.data.hierarchy.maxDepth).toBe(10);
      expect(result.data.totalNodes).toBeGreaterThan(10);
    });
  });

  describe('Color Analysis Integration', () => {
    test('extracts colors from fills and strokes', () => {
      const nodes = [
        createMockNode('RECTANGLE', {
          fills: [createMockSolidPaint(createMockColor(255, 0, 0))],
          strokes: [createMockSolidPaint(createMockColor(0, 255, 0))]
        }),
        createMockNode('ELLIPSE', {
          fills: [createMockSolidPaint(createMockColor(0, 0, 255))]
        })
      ];

      mockFigma.currentPage = createMockPage(nodes);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.data.colors.fills).toContain('#ff0000');
      expect(result.data.colors.fills).toContain('#0000ff');
      expect(result.data.colors.strokes).toContain('#00ff00');
      expect(result.data.colors.total).toBe(3);
    });

    test('deduplicates identical colors across nodes', () => {
      const nodes = [
        createMockNode('RECTANGLE', {
          fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
        }),
        createMockNode('RECTANGLE', {
          fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
        }),
        createMockNode('RECTANGLE', {
          fills: [createMockSolidPaint(createMockColor(255, 0, 0))]
        })
      ];

      mockFigma.currentPage = createMockPage(nodes);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.data.colors.total).toBe(1);
      expect(result.data.colors.fills).toHaveLength(1);
    });
  });

  describe('Component Analysis Integration', () => {
    test('tracks component usage across page', () => {
      const mainComponent = createMockNode('COMPONENT', {
        name: 'Button',
        key: 'button-key'
      });

      const nodes = [
        mainComponent,
        createMockNode('INSTANCE', {
          mainComponent: { id: mainComponent.id, name: 'Button' }
        }),
        createMockNode('INSTANCE', {
          mainComponent: { id: mainComponent.id, name: 'Button' }
        }),
        createMockNode('INSTANCE', {
          mainComponent: { id: mainComponent.id, name: 'Button' }
        })
      ];

      mockFigma.currentPage = createMockPage(nodes);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.data.components.total).toBe(1);
      expect(result.data.components.instances).toBe(3);
      expect(result.data.components.uniqueComponents).toBe(1);
    });
  });

  describe('Text Analysis Integration', () => {
    test('aggregates text statistics across page', () => {
      const nodes = [
        createMockNode('TEXT', {
          characters: 'Hello',
          fontName: { family: 'Inter', style: 'Regular' }
        }),
        createMockNode('TEXT', {
          characters: 'World',
          fontName: { family: 'Inter', style: 'Bold' }
        }),
        createMockNode('TEXT', {
          characters: '!',
          fontName: { family: 'Roboto', style: 'Regular' }
        })
      ];

      mockFigma.currentPage = createMockPage(nodes);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(result.data.text.totalTextNodes).toBe(3);
      expect(result.data.text.totalCharacters).toBe(11);
      expect(result.data.text.uniqueFonts).toHaveLength(3);
      expect(result.data.text.textContents).toHaveLength(3);
    });
  });

  describe('Error Handling Integration', () => {
    test('handles missing page gracefully', () => {
      mockFigma.currentPage = null;
      analyzePage();

      expect(mockFigma.ui.postMessage).toHaveBeenCalledWith({
        type: 'error',
        message: 'No page selected'
      });
    });

    test('handles malformed nodes gracefully', () => {
      mockFigma.currentPage = {
        name: 'Test Page',
        children: [
          { type: 'UNKNOWN', id: 'test' } // Malformed node
        ]
      };

      expect(() => analyzePage()).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('completes analysis within reasonable time for large pages', () => {
      const nodes = [];
      for (let i = 0; i < 1000; i++) {
        nodes.push(createMockNode('RECTANGLE'));
      }

      mockFigma.currentPage = createMockPage(nodes);

      const startTime = Date.now();
      analyzePage();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('handles deep nesting efficiently', () => {
      const deepStructure = createNestedStructure(20, 2);
      mockFigma.currentPage = createMockPage([deepStructure]);

      const startTime = Date.now();
      analyzePage();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  describe('Data Integrity Tests', () => {
    test('ensures all data is serializable to JSON', () => {
      const nodes = [
        createMockNode('FRAME', {
          children: [
            createMockNode('TEXT', {
              characters: 'Test',
              fontName: { family: 'Inter', style: 'Regular' }
            })
          ]
        })
      ];

      mockFigma.currentPage = createMockPage(nodes);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(() => JSON.stringify(result.data)).not.toThrow();
    });

    test('ensures no circular references in result', () => {
      const parent = createMockNode('FRAME');
      const child = createMockNode('RECTANGLE');
      parent.children = [child];

      mockFigma.currentPage = createMockPage([parent]);
      analyzePage();

      const result = mockFigma.ui.postMessage.mock.calls[0][0];

      expect(() => JSON.stringify(result.data)).not.toThrow();
    });
  });
});
