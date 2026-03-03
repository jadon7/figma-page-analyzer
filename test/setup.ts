// Global test setup
(global as any).figma = {
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

// Mock __html__ global
(global as any).__html__ = '<html></html>';
