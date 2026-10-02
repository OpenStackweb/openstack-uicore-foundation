/**
 * @jest-environment jsdom
 */
import { resolveFont } from '../resolve-font';

const fakePdfMake = () => ({ addFontContainer: jest.fn() });

describe('resolveFont', () => {
  afterEach(() => jest.restoreAllMocks());

  it('falls back to Helvetica for none / standard, registering nothing', async () => {
    const pdfMake = fakePdfMake();
    await expect(resolveFont(pdfMake, undefined)).resolves.toBe('Helvetica');
    await expect(resolveFont(pdfMake, 'Helvetica')).resolves.toBe('Helvetica');
    await expect(resolveFont(pdfMake, { family: 'Helvetica' })).resolves.toBe('Helvetica');
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
  });

  it('registers an imported/pre-baked container without fetching', async () => {
    global.fetch = jest.fn();
    const pdfMake = fakePdfMake();
    const font = { family: 'Imported', vfs: { 'Imported-normal.ttf': 'QUFB' }, fonts: { Imported: { normal: 'Imported-normal.ttf' } } };
    await expect(resolveFont(pdfMake, font)).resolves.toBe('Imported');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(pdfMake.addFontContainer).toHaveBeenCalledWith({ vfs: font.vfs, fonts: font.fonts });
  });

  it('fetches + base64s a URL font and registers a container', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new Uint8Array([65, 66, 67]).buffer) }));
    const pdfMake = fakePdfMake();
    const fam = await resolveFont(pdfMake, { family: 'Brand', urls: { normal: 'https://x/n.ttf', bold: 'https://x/b.ttf' } });
    expect(fam).toBe('Brand');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const container = pdfMake.addFontContainer.mock.calls[0][0];
    expect(container.vfs['Brand-normal.ttf']).toBe('QUJD'); // base64 of [65,66,67]
    expect(container.fonts.Brand.normal).toBe('Brand-normal.ttf');
    expect(container.fonts.Brand.bold).toBe('Brand-bold.ttf');
  });

  it('falls back to Helvetica when the URL font fails to fetch', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 403 }));
    const pdfMake = fakePdfMake();
    const fam = await resolveFont(pdfMake, { family: 'Broken', urls: { normal: 'https://x/nope.ttf' } });
    expect(fam).toBe('Helvetica');
    expect(pdfMake.addFontContainer).not.toHaveBeenCalled();
  });
});
