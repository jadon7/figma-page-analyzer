# Figma Page Analyzer Plugin

A comprehensive Figma plugin that analyzes and provides detailed statistics about all elements on the current page.

## Features

- **Node Statistics**: Count all nodes by type (frames, components, instances, text, shapes, etc.)
- **Component Analysis**: Track component usage, instances, and unique components
- **Color Analysis**: Extract and display all colors used (fills and strokes)
- **Text Statistics**: Count text nodes, characters, and unique fonts
- **Style Tracking**: Analyze text, fill, stroke, and effect styles
- **Hierarchy Analysis**: Show layer depth distribution and maximum depth
- **Dimension Analysis**: Display largest nodes and page dimensions
- **JSON Export**: Export all analysis results as JSON

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

1. Open a Figma file and select a page you want to analyze
2. Run the plugin from `Plugins` → `Development` → `Page Analyzer`
3. Click "Analyze Page" to start the analysis
4. View the comprehensive statistics in the UI
5. Click "Export JSON" to download the results as a JSON file

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
└── README.md        # Documentation
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development

### Technologies

- **TypeScript**: Type-safe plugin development
- **Figma Plugin API**: Access to Figma document structure
- **Vanilla JavaScript**: Lightweight UI without frameworks
- **CSS3**: Modern, responsive styling

## Error Handling

The plugin includes comprehensive error handling:
- Validates page selection
- Handles missing or invalid data gracefully
- Displays user-friendly error messages
- Prevents crashes from unexpected node types

## Performance

- Efficient recursive node traversal
- Optimized color extraction
- Minimal memory footprint
- Fast analysis even on large pages

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
