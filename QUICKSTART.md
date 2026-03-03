# Quick Start Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Plugin**
   ```bash
   npm run build
   ```

3. **Load in Figma**
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Navigate to this folder and select `manifest.json`
   - Click "Open"

4. **Run the Plugin**
   - Open any Figma file
   - Go to `Plugins` → `Development` → `Page Analyzer`
   - Click "Analyze Page" to see statistics

## Features at a Glance

✅ **Node Analysis** - Count all nodes by type
✅ **Component Tracking** - Track components and instances
✅ **Color Extraction** - Visual display of all colors used
✅ **Text Statistics** - Character count and font analysis
✅ **Style Counting** - All design styles tracked
✅ **Hierarchy Depth** - Layer structure analysis
✅ **JSON Export** - Download complete analysis data

## Development Mode

For active development, use watch mode:
```bash
npm run watch
```

This will automatically recompile when you make changes to `code.ts`.

## Troubleshooting

**Plugin doesn't appear in Figma:**
- Make sure you're using Figma Desktop (not browser)
- Check that `code.js` was generated after running `npm run build`
- Try removing and re-importing the plugin

**Build errors:**
- Delete `node_modules` and run `npm install` again
- Make sure you have Node.js 14+ installed

**Analysis not working:**
- Make sure you have a page selected in Figma
- Check the browser console in Figma for errors (Plugins → Development → Open Console)

## File Structure

```
figma-page-analyzer/
├── code.ts          # Main plugin logic (TypeScript)
├── code.js          # Compiled JavaScript (generated)
├── ui.html          # Plugin UI
├── manifest.json    # Plugin configuration
├── package.json     # Dependencies
├── tsconfig.json    # TypeScript config
└── README.md        # Full documentation
```

## Next Steps

- Customize the UI styling in `ui.html`
- Add more analysis features in `code.ts`
- Publish to Figma Community when ready

Enjoy analyzing your Figma pages! 🎨
