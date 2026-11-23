/**
 * @jest-environment jsdom
 */
/* eslint-disable no-magic-numbers */
import { loadFont, resolveFont } from '../resolve-font';
import { bytesToBase64 } from '../base64';
import { createFakePdfMake } from '../__fixtures__/fake-pdfmake';
import { neverAnswers, serveFiles } from '../__fixtures__/fetch';
import {
  modernTables, oldTables, widthTables, ttf, woff2, MODERN, OLD,
} from '../__fixtures__/font-files';
import { HELVETICA_FONT_METRICS } from '../helvetica-metrics';

const HELVETICA_FONT = { family: 'Helvetica', fontMetrics: HELVETICA_FONT_METRICS };

const newPdfMake = () => createFakePdfMake().pdfMake;

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('resolveFont', () => {
  it('falls back to Helvetica for none / standard, registering nothing', async () => {
    const pdfMake = newPdfMake();
    await expect(resolveFont(pdfMake, undefined)).resolves.toBe('Helvetica');
    await expect(resolveFont(pdfMake, 'Helvetica')).resolves.toBe('Helvetica');
    await expect(resolveFont(pdfMake, { family: 'Helvetica' })).resolves.toBe('Helvetica');
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
  });

  it('registers an imported/pre-baked container without fetching', async () => {
    global.fetch = jest.fn();
    const pdfMake = newPdfMake();
    const font = { family: 'Imported', vfs: { 'Imported-normal.ttf': 'QUFB' }, fonts: { Imported: { normal: 'Imported-normal.ttf' } } };
    await expect(resolveFont(pdfMake, font)).resolves.toBe('Imported');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(pdfMake.addFontContainer).toHaveBeenCalledWith({
      vfs: font.vfs,
      fonts: {
        Imported: {
          normal: 'Imported-normal.ttf',
          bold: 'Imported-normal.ttf',
          italics: 'Imported-normal.ttf',
          bolditalics: 'Imported-normal.ttf',
        },
      },
    });
  });

  it('falls back to Helvetica when a pre-baked container does not define its family', async () => {
    const pdfMake = newPdfMake();
    const font = { family: 'Brand', vfs: { 'BrandSans-normal.ttf': 'QUFB' }, fonts: { BrandSans: { normal: 'BrandSans-normal.ttf' } } };
    await expect(resolveFont(pdfMake, font)).resolves.toBe('Helvetica');
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
  });

  it('fetches + base64s a URL font and registers a container', async () => {
    const normal = ttf(modernTables());
    const bold = ttf(oldTables());
    global.fetch = serveFiles({ 'https://x/n.ttf': normal, 'https://x/b.ttf': bold });
    const pdfMake = newPdfMake();
    const fam = await resolveFont(pdfMake, { family: 'Brand', urls: { normal: 'https://x/n.ttf', bold: 'https://x/b.ttf' } });
    expect(fam).toBe('Brand');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const container = pdfMake.addFontContainer.mock.calls[0][0];
    expect(container.vfs['Brand-normal.ttf']).toBe(bytesToBase64(normal));
    expect(container.vfs['Brand-bold.ttf']).toBe(bytesToBase64(bold));
    expect(container.fonts.Brand.normal).toBe('Brand-normal.ttf');
    expect(container.fonts.Brand.bold).toBe('Brand-bold.ttf');
  });

  it('falls back to Helvetica when the URL font fails to fetch', async () => {
    global.fetch = serveFiles({});
    const pdfMake = newPdfMake();
    const fam = await resolveFont(pdfMake, { family: 'Broken', urls: { normal: 'https://x/nope.ttf' } });
    expect(fam).toBe('Helvetica');
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
  });
});

describe('loadFont', () => {
  it("gives Helvetica's metrics for every style without a font", async () => {
    await expect(loadFont(newPdfMake(), undefined)).resolves.toEqual(HELVETICA_FONT);
  });

  it("gives each style's metrics, read from the file that prints it", async () => {
    global.fetch = serveFiles({ 'https://m/n.ttf': ttf(modernTables()), 'https://m/b.ttf': ttf(oldTables()) });
    const font = await loadFont(newPdfMake(), {
      family: 'Metrics',
      urls: { normal: 'https://m/n.ttf', bold: 'https://m/b.ttf' },
    });
    expect(font).toEqual({
      family: 'Metrics',
      fontMetrics: { normal: MODERN, bold: OLD, italics: MODERN, bolditalics: OLD },
    });
  });

  it("gives each style's text widths, read from the file that prints it", async () => {
    global.fetch = serveFiles({ 'https://w/r.ttf': ttf(widthTables()) });
    const { fontMetrics } = await loadFont(newPdfMake(), {
      family: 'Widths',
      urls: { normal: 'https://w/r.ttf' },
    });
    expect(fontMetrics.bold.textWidth('AB')).toBeCloseTo(1.3);
    expect(fontMetrics.italics).toBe(fontMetrics.normal);
  });

  it('fetches each URL once and fills missing styles from the closest one', async () => {
    global.fetch = serveFiles({ 'https://f/r.ttf': ttf(modernTables()) });
    const pdfMake = newPdfMake();
    await loadFont(pdfMake, { family: 'Regular', urls: { normal: 'https://f/r.ttf' } });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const { vfs, fonts } = pdfMake.addFontContainer.mock.calls[0][0];
    expect(Object.keys(vfs)).toEqual(['Regular-normal.ttf']);
    expect(fonts.Regular).toEqual({
      normal: 'Regular-normal.ttf',
      bold: 'Regular-normal.ttf',
      italics: 'Regular-normal.ttf',
      bolditalics: 'Regular-normal.ttf',
    });

    global.fetch = serveFiles({ 'https://f/n.ttf': ttf(modernTables()), 'https://f/b.ttf': ttf(oldTables()) });
    const twoFiles = newPdfMake();
    await loadFont(twoFiles, { family: 'Two', urls: { normal: 'https://f/n.ttf', bold: 'https://f/b.ttf' } });
    expect(twoFiles.addFontContainer.mock.calls[0][0].fonts.Two).toEqual({
      normal: 'Two-normal.ttf',
      bold: 'Two-bold.ttf',
      italics: 'Two-normal.ttf',
      bolditalics: 'Two-bold.ttf',
    });
  });

  it('caches a font, so the next document does not fetch it again', async () => {
    global.fetch = serveFiles({ 'https://c/r.ttf': ttf(modernTables()) });
    const font = { family: 'Cached', urls: { normal: 'https://c/r.ttf' } };
    const first = await loadFont(newPdfMake(), font);
    const pdfMake = newPdfMake();
    await expect(loadFont(pdfMake, font)).resolves.toEqual(first);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(pdfMake.addFontContainer).toHaveBeenCalled();
  });

  it("prints a font whose metrics can't be read, with null metrics", async () => {
    const tables = modernTables();
    delete tables['OS/2'];
    global.fetch = serveFiles({ 'https://n/r.ttf': ttf(tables) });
    const pdfMake = newPdfMake();
    const font = await loadFont(pdfMake, { family: 'NoMetrics', urls: { normal: 'https://n/r.ttf' } });
    expect(font.family).toBe('NoMetrics');
    expect(font.fontMetrics.normal).toBeNull();
    expect(pdfMake.addFontContainer).toHaveBeenCalled();
  });

  it("falls back to Helvetica for a file that isn't a font, and tries again next time", async () => {
    const html = Uint8Array.from('<!doctype html><title>Not found</title>', (c) => c.charCodeAt(0));
    global.fetch = serveFiles({ 'https://h/r.ttf': html });
    const font = { family: 'Html', urls: { normal: 'https://h/r.ttf' } };
    const pdfMake = newPdfMake();
    await expect(loadFont(pdfMake, font)).resolves.toEqual(HELVETICA_FONT);
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      '[pdf] font "Html" failed, using Helvetica:',
      'not a TTF, OTF or WOFF file: https://h/r.ttf',
    );

    global.fetch = serveFiles({ 'https://h/r.ttf': ttf(modernTables()) });
    await expect(loadFont(newPdfMake(), font)).resolves.toMatchObject({ family: 'Html' });
  });

  it('falls back to Helvetica for a file cut short, and tries again next time', async () => {
    const file = ttf(oldTables());
    global.fetch = serveFiles({ 'https://t/r.ttf': file.slice(0, file.length - 10) });
    const font = { family: 'Cut', urls: { normal: 'https://t/r.ttf' } };
    await expect(loadFont(newPdfMake(), font)).resolves.toEqual(HELVETICA_FONT);
    expect(console.warn).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('cut short'));

    global.fetch = serveFiles({ 'https://t/r.ttf': file });
    await expect(loadFont(newPdfMake(), font)).resolves.toMatchObject({ family: 'Cut' });
  });

  it('falls back to Helvetica for WOFF2, which pdfmake prints blank', async () => {
    global.fetch = serveFiles({ 'https://w/r.woff2': woff2() });
    await expect(
      loadFont(newPdfMake(), { family: 'Woff2', urls: { normal: 'https://w/r.woff2' } }),
    ).resolves.toEqual(HELVETICA_FONT);
    expect(console.warn).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('WOFF2'));
  });

  it('falls back to Helvetica for the whole font when one of its files fails, and stops the others', async () => {
    const slow = neverAnswers();
    global.fetch = jest.fn((url, options) => (url === 'https://p/b.ttf'
      ? slow(url, options)
      : Promise.resolve({ ok: false, status: 404 })));
    const pdfMake = newPdfMake();
    await expect(
      loadFont(pdfMake, { family: 'Partial', urls: { normal: 'https://p/n.ttf', bold: 'https://p/b.ttf' } }),
    ).resolves.toEqual(HELVETICA_FONT);
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
    expect(slow.mock.calls[0][1].signal.aborted).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(expect.any(String), 'font fetch failed (404): https://p/n.ttf');
  });

  it('stops waiting after 10 seconds, uses Helvetica, and tries again next time', async () => {
    jest.useFakeTimers();
    try {
      global.fetch = neverAnswers();
      const font = { family: 'Slow', urls: { normal: 'https://s/r.ttf' } };
      const loading = loadFont(newPdfMake(), font);
      jest.advanceTimersByTime(10000);
      await expect(loading).resolves.toEqual(HELVETICA_FONT);
      expect(console.warn).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('10 seconds'));

      global.fetch = serveFiles({ 'https://s/r.ttf': ttf(modernTables()) });
      await expect(loadFont(newPdfMake(), font)).resolves.toMatchObject({ family: 'Slow' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('falls back to Helvetica for a URL font without a file URL', async () => {
    global.fetch = jest.fn();
    await expect(loadFont(newPdfMake(), { family: 'Empty', urls: {} })).resolves.toEqual(HELVETICA_FONT);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('falls back to Helvetica for a pre-baked container without files', async () => {
    const pdfMake = newPdfMake();
    await expect(
      loadFont(pdfMake, { family: 'Bare', vfs: {}, fonts: { Bare: {} } }),
    ).resolves.toEqual(HELVETICA_FONT);
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
  });

  it("reads a pre-baked container's metrics from its vfs", async () => {
    const font = {
      family: 'Baked',
      vfs: { 'Baked-normal.ttf': bytesToBase64(ttf(modernTables())), 'Baked-bold.ttf': bytesToBase64(ttf(oldTables())) },
      fonts: { Baked: { normal: 'Baked-normal.ttf', bold: 'Baked-bold.ttf' } },
    };
    await expect(loadFont(newPdfMake(), font)).resolves.toEqual({
      family: 'Baked',
      fontMetrics: { normal: MODERN, bold: OLD, italics: MODERN, bolditalics: OLD },
    });
  });
});
