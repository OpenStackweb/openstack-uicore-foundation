/**
 * @jest-environment node
 */
// Node has DecompressionStream, Blob and Response, which jsdom lacks.
/* eslint-disable no-magic-numbers */
import { fontFormat, isCompleteFontFile, readFontMetrics } from '../font-metrics';
import {
  modernTables, oldTables, ttf, woff, woff2, MODERN, OLD,
} from '../__fixtures__/font-files';

const html = new TextEncoder().encode('<!doctype html><html></html>');

describe('fontFormat', () => {
  it('tells the format from the first four bytes', () => {
    expect(fontFormat(ttf(modernTables()))).toBe('sfnt');
    expect(fontFormat(ttf(modernTables(), 0x4f54544f))).toBe('sfnt'); // OTF
    expect(fontFormat(ttf(modernTables(), 0x74727565))).toBe('sfnt'); // "true"
    expect(fontFormat(woff(modernTables()))).toBe('woff');
    expect(fontFormat(woff2())).toBe('woff2');
  });

  it('gives null for other files and files under four bytes', () => {
    expect(fontFormat(html)).toBeNull();
    expect(fontFormat(new Uint8Array([0, 1, 0]))).toBeNull();
  });
});

describe('isCompleteFontFile', () => {
  it('accepts TTF and WOFF files whose tables lie inside them', () => {
    expect(isCompleteFontFile(ttf(oldTables()))).toBe(true);
    expect(isCompleteFontFile(woff(oldTables()))).toBe(true);
  });

  it('rejects a file cut short in its tables or in its table directory', () => {
    const file = ttf(oldTables());
    expect(isCompleteFontFile(file.slice(0, file.length - 1))).toBe(false);
    expect(isCompleteFontFile(file.slice(0, 20))).toBe(false);
    const packed = woff(oldTables());
    expect(isCompleteFontFile(packed.slice(0, packed.length - 1))).toBe(false);
  });

  it('rejects other formats', () => {
    expect(isCompleteFontFile(woff2())).toBe(false);
    expect(isCompleteFontFile(html)).toBe(false);
  });
});

describe('readFontMetrics', () => {
  it('reads the ascender from hhea and the cap height from OS/2', async () => {
    await expect(readFontMetrics(ttf(modernTables()))).resolves.toEqual(MODERN);
    // OpenType with CFF outlines has the same tables.
    await expect(readFontMetrics(ttf(modernTables(), 0x4f54544f))).resolves.toEqual(MODERN);
  });

  it('measures the H glyph when OS/2 has no cap height', async () => {
    await expect(readFontMetrics(ttf(oldTables()))).resolves.toEqual(OLD);
  });

  it("returns null when it can't find a cap height", async () => {
    const tables = oldTables();
    delete tables.glyf;
    await expect(readFontMetrics(ttf(tables))).resolves.toBeNull();
  });

  it('inflates the tables of a WOFF file', async () => {
    await expect(readFontMetrics(woff(modernTables()))).resolves.toEqual(MODERN);
  });

  it('reads WOFF tables stored compressed or as they are', async () => {
    await expect(readFontMetrics(woff(oldTables()))).resolves.toEqual(OLD);
  });

  it("returns null for WOFF where the browser can't inflate it", async () => {
    const { DecompressionStream } = global;
    delete global.DecompressionStream;
    try {
      await expect(readFontMetrics(woff(modernTables()))).resolves.toBeNull();
    } finally {
      global.DecompressionStream = DecompressionStream;
    }
  });

  it("returns null for formats it can't read", async () => {
    await expect(readFontMetrics(woff2())).resolves.toBeNull();
    await expect(
      readFontMetrics(new TextEncoder().encode('<!doctype html><html></html>')),
    ).resolves.toBeNull();
  });

  it('rejects for a damaged file', async () => {
    await expect(readFontMetrics(ttf(modernTables()).slice(0, 40))).rejects.toThrow();
    const broken = woff(modernTables());
    broken.fill(0xff, 44 + 3 * 20); // tables that don't inflate
    await expect(readFontMetrics(broken)).rejects.toThrow();
  });
});
