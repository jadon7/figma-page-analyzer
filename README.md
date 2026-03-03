# Figma Page Analyzer Plugin v2.0

A comprehensive Figma plugin that analyzes pages and inspects individual elements with detailed statistics and real-time property viewing.

## ✨ Features

### Page Analysis
- **Node Statistics**: Count all nodes by type (frames, components, instances, text, shapes, etc.)
- **Component Analysis**: Track component usage, instances, and unique components
- **Color Analysis**: Extract and display all colors used (fills and strokes)
- **Text Statistics**: Count text nodes, characters, and unique fonts
- **Style Tracking**: Analyze text, fill, stroke, and effect styles
- **Hierarchy Analysis**: Show layer depth distribution and maximum depth
- **Dimension Analysis**: Display largest nodes and page dimensions
- **JSON Export**: Export all analysis results as JSON

### Element Inspector (NEW in v2.0)
- **Real-time Selection Tracking**: Automatically updates when you select elements
- **Comprehensive Properties**: View all element properties including position, dimensions, fills, strokes, effects, constraints, auto-layout, text properties, and more
- **Copy JSON**: Export selected element properties as JSON with one click
- **Multiple Selection Support**: Shows list when multiple elements are selected
- **Beautiful UI**: Organized property sections with gradient headers

### Testing (NEW in v2.0)
- **52 Comprehensive Tests**: Unit and integration tests covering all functionality
- **57% Code Coverage**: Focus on critical paths and edge cases
- **Jest Framework**: Modern testing with TypeScript support
- **Mock System**: Complete Figma API mocks for reliable testing

## Installation

### Development Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. In Figma:
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from this directory
   - The plugin will now appear in your plugins list

### Production Build

The plugin is production-ready with:
- TypeScript for type safety
- Comprehensive error handling
- Clean, responsive UI
- Efficient node traversal
- JSON export functionality

## Usage

### Page Analysis
1. Open a Figma file and select a page you want to analyze
2. Run the plugin from `Plugins` → `Development` → `Page Analyzer`
3. Stay on the "Page Analysis" tab (default)
4. Click "Analyze Page" to start the analysis
5. View the comprehensive statistics in the UI
6. Click "Export JSON" to download the results as a JSON file

### Element Inspector
1. Open the plugin
2. Click the "Element Inspector" tab
3. Select any element in your Figma canvas
4. View all properties in real-time
5. Click "Copy JSON" to export the element's properties
6. Select multiple elements to see a list of all selected items

## Statistics Provided

### Overview
- Total node count
- Maximum hierarchy depth
- Average hierarchy depth

### Nodes by Type
- Breakdown of all node types (FRAME, TEXT, RECTANGLE, etc.)
- Count for each type

### Components
- Total components
- Component sets
- Component instances
- Unique components used

### Colors
- All unique colors from fills and strokes
- Visual color swatches (click to copy hex code)
- Total unique color count

### Text
- Total text nodes
- Total character count
- Unique fonts used

### Styles
- Text styles count
- Fill styles count
- Stroke styles count
- Effect styles count

### Dimensions
- Largest node on the page
- Node dimensions

## Development

### File Structure

```
figma-page-analyzer/
├── code.ts          # Main plugin logic
├── ui.html          # Plugin UI interface
├── manifest.json    # Plugin manifest
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
├── jest.config.js   # Jest test configuration
├── test/            # Test directory
│   ├── setup.ts              # Test setup
│   ├── mocks.ts              # Mock Figma API
│   ├── colorUtils.test.ts    # Color tests
│   ├── analyzeNode.test.ts   # Node analysis tests
│   ├── analyzePage.test.ts   # Page analysis tests
│   ├── integration.test.ts   # Integration tests
│   └── README.md             # Test documentation
└── README.md        # Documentation
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:verbose` - Run tests with verbose output

### Technologies

- **TypeScript**: Type-safe plugin development
- **Figma Plugin API**: Access to Figma document structure
- **Vanilla JavaScript**: Lightweight UI without frameworks
- **CSS3**: Modern, responsive styling
- **Jest**: Testing framework
- **ts-jest**: TypeScript support for Jest

## Testing

The plugin includes a comprehensive test suite with 52 tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- 57% statement coverage
- 52 tests passing
- Unit tests for all core functions
- Integration tests for complete workflows
- Performance benchmarks

See [test/README.md](test/README.md) for detailed testing documentation.

## Error Handling

The plugin includes comprehensive error handling:
- Validates page selection
- Handles missing or invalid data gracefully
- Displays user-friendly error messages
- Prevents crashes from unexpected node types

## Performance

- Analyzes pages of any size efficiently
- Handles all Figma node types
- Fast analysis even on large pages (< 1s for 1000 nodes)
- Real-time element inspector updates (< 50ms)
- Deep nesting support (< 2s for 20 levels)

## Export Format

The JSON export includes all analyzed data:

```json
{
  "pageName": "Page 1",
  "totalNodes": 150,
  "nodesByType": { ... },
  "components": { ... },
  "colors": { ... },
  "text": { ... },
  "styles": { ... },
  "hierarchy": { ... },
  "dimensions": { ... }
}
```

## Browser Compatibility

The plugin UI works in all modern browsers that support:
- ES2020 JavaScript
- CSS Grid
- Flexbox
- Modern DOM APIs

## License

MIT

## Support

For issues or feature requests, please open an issue in the repository.

## Version History

### 2.0.0 (Current - Optimized)
- ✅ **NEW**: Selected Element Inspector with real-time updates
- ✅ **NEW**: Comprehensive test suite (52 tests, 57% coverage)
- ✅ **NEW**: Copy JSON for selected elements
- ✅ **NEW**: Tabbed UI interface
- ✅ **NEW**: Multiple selection support
- ✅ Enhanced code architecture with exported functions
- ✅ Improved error handling
- ✅ Performance optimizations
- ✅ Complete test coverage for core functionality

### 1.0.0 (Initial Release)
- Complete page analysis functionality
- Node type counting
- Component and instance tracking
- Color extraction and display
- Text and font analysis
- Style counting
- Hierarchy depth analysis
- JSON export
- Clean, responsive UI

---

For detailed changes, see [CHANGELOG.md](CHANGELOG.md)
