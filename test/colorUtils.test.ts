import { colorToHex, extractColors } from '../code';
import { createMockColor, createMockSolidPaint, createMockGradientPaint } from './mocks';

describe('colorToHex', () => {
  test('converts RGB to hex correctly', () => {
    const color = createMockColor(255, 0, 0);
    expect(colorToHex(color)).toBe('#ff0000');
  });

  test('converts RGB with alpha to rgba string', () => {
    const color = createMockColor(255, 0, 0, 0.5);
    expect(colorToHex(color)).toBe('rgba(255, 0, 0, 0.50)');
  });

  test('handles black color', () => {
    const color = createMockColor(0, 0, 0);
    expect(colorToHex(color)).toBe('#000000');
  });

  test('handles white color', () => {
    const color = createMockColor(255, 255, 255);
    expect(colorToHex(color)).toBe('#ffffff');
  });

  test('handles mid-range colors', () => {
    const color = createMockColor(128, 64, 192);
    expect(colorToHex(color)).toBe('#8040c0');
  });

  test('pads single digit hex values', () => {
    const color = createMockColor(1, 2, 3);
    expect(colorToHex(color)).toBe('#010203');
  });
});

describe('extractColors', () => {
  test('extracts solid color from paint', () => {
    const colorSet = new Set<string>();
    const paint = createMockSolidPaint(createMockColor(255, 0, 0));
    extractColors([paint], colorSet);

    expect(colorSet.size).toBe(1);
    expect(colorSet.has('#ff0000')).toBe(true);
  });

  test('extracts multiple colors from gradient', () => {
    const colorSet = new Set<string>();
    const paint = createMockGradientPaint([
      { color: createMockColor(255, 0, 0), position: 0 },
      { color: createMockColor(0, 0, 255), position: 1 }
    ]);
    extractColors([paint], colorSet);

    expect(colorSet.size).toBe(2);
    expect(colorSet.has('#ff0000')).toBe(true);
    expect(colorSet.has('#0000ff')).toBe(true);
  });

  test('handles mixed paints', () => {
    const colorSet = new Set<string>();
    extractColors(figma.mixed as any, colorSet);

    expect(colorSet.size).toBe(0);
  });

  test('handles empty paint array', () => {
    const colorSet = new Set<string>();
    extractColors([], colorSet);

    expect(colorSet.size).toBe(0);
  });

  test('handles null paints', () => {
    const colorSet = new Set<string>();
    extractColors(null as any, colorSet);

    expect(colorSet.size).toBe(0);
  });

  test('extracts colors from multiple solid paints', () => {
    const colorSet = new Set<string>();
    const paints = [
      createMockSolidPaint(createMockColor(255, 0, 0)),
      createMockSolidPaint(createMockColor(0, 255, 0)),
      createMockSolidPaint(createMockColor(0, 0, 255))
    ];
    extractColors(paints, colorSet);

    expect(colorSet.size).toBe(3);
    expect(colorSet.has('#ff0000')).toBe(true);
    expect(colorSet.has('#00ff00')).toBe(true);
    expect(colorSet.has('#0000ff')).toBe(true);
  });

  test('deduplicates identical colors', () => {
    const colorSet = new Set<string>();
    const paints = [
      createMockSolidPaint(createMockColor(255, 0, 0)),
      createMockSolidPaint(createMockColor(255, 0, 0)),
      createMockSolidPaint(createMockColor(255, 0, 0))
    ];
    extractColors(paints, colorSet);

    expect(colorSet.size).toBe(1);
    expect(colorSet.has('#ff0000')).toBe(true);
  });
});
