/**
 * @jest-environment jsdom
 */
import { imageDataUrl } from '../image-data-url';

describe('imageDataUrl', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns a falsy src as null (no fetch)', async () => {
    await expect(imageDataUrl(null)).resolves.toBeNull();
  });

  it('passes an existing data: URL through unchanged (no fetch)', async () => {
    global.fetch = jest.fn();
    const dataUrl = 'data:image/png;base64,AAAA';
    await expect(imageDataUrl(dataUrl)).resolves.toBe(dataUrl);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches an http(s) URL and resolves to a data: URL, cached', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['abc'], { type: 'image/png' })) }),
    );
    const first = await imageDataUrl('https://cdn.example.com/logo.png');
    expect(typeof first).toBe('string');
    expect(first.indexOf('data:')).toBe(0);
    // second call hits the cache — no extra fetch
    const second = await imageDataUrl('https://cdn.example.com/logo.png');
    expect(second).toBe(first);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
