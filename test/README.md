# Test Suite for Figma Page Analyzer

This directory contains comprehensive tests for the Figma Page Analyzer plugin.

## Test Structure

```
test/
├── mocks.ts              # Mock Figma API and helper functions
├── colorUtils.test.ts    # Unit tests for color utilities
├── analyzeNode.test.ts   # Unit tests for node analysis
├── analyzePage.test.ts   # Unit tests for page analysis
└── integration.test.ts   # Integration tests for complete workflows
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Test Coverage

The test suite covers:

### Unit Tests

1. **Color Utilities** (`colorUtils.test.ts`)
   - RGB to hex conversion
   - RGBA to rgba string conversion
   - Color extraction from paints
   - Gradient color extraction
   - Edge cases (black, white, mixed)

2. **Node Analysis** (`analyzeNode.test.ts`)
   - Single node counting
   - Hierarchy depth tracking
   - Component and instance counting
   - Text node analysis
   - Color extraction from fills/strokes
   - Largest node tracking
   - Recursive child analysis
   - Deep nested structures

3. **Page Analysis** (`analyzePage.test.ts`)
   - Empty page handling
   - Single and multiple node analysis
   - Hierarchy calculations
   - Component/instance counting
   - Color aggregation
   - Text statistics
   - Largest node detection
   - Error handling
   - Data serialization

### Integration Tests

1. **Complete Workflows** (`integration.test.ts`)
   - Complex page analysis with mixed content
   - Large page handling (100+ nodes)
   - Deep nesting (10+ levels)
   - Color deduplication across nodes
   - Component usage tracking
   - Text aggregation
   - Error handling
   - Performance benchmarks
   - Data integrity checks

## Mock System

The `mocks.ts` file provides:

- `mockFigma`: Mock Figma API object
- `createMockNode()`: Factory for creating mock nodes
- `createMockColor()`: Helper for creating color objects
- `createMockSolidPaint()`: Helper for solid paint objects
- `createMockGradientPaint()`: Helper for gradient paint objects
- `createMockPage()`: Factory for creating mock pages
- `createNestedStructure()`: Helper for creating deep hierarchies

## Test Philosophy

1. **Comprehensive Coverage**: Tests cover all major functions and edge cases
2. **Isolation**: Unit tests are isolated and don't depend on each other
3. **Integration**: Integration tests verify complete workflows
4. **Performance**: Performance tests ensure scalability
5. **Maintainability**: Clear test names and structure for easy maintenance

## Adding New Tests

When adding new features:

1. Add unit tests for individual functions
2. Add integration tests for complete workflows
3. Update mocks if new Figma API features are used
4. Ensure tests are isolated and repeatable
5. Add performance tests for computationally intensive features

## Coverage Goals

- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 90%

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

To debug a specific test:

```bash
# Run a specific test file
npx jest colorUtils.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="converts RGB"

# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Known Limitations

1. Tests use mocks and don't test against real Figma API
2. UI interactions are not tested (requires browser environment)
3. Some Figma-specific behaviors may differ from mocks

## Future Improvements

- [ ] Add E2E tests with real Figma plugin environment
- [ ] Add UI component tests
- [ ] Add visual regression tests
- [ ] Increase coverage to 90%+
- [ ] Add mutation testing
