/**
 * @jest-environment jsdom
 */
/* eslint-disable no-magic-numbers */
// Test data: file signatures, sizes and status codes.
import { TextDecoder, TextEncoder } from 'util';
import { loadImage } from '../load-image';
import { bytesToBase64 } from '../base64';
import { neverAnswers, serveBytes } from '../__fixtures__/fetch';

// jsdom doesn't give TextDecoder, which the SVG check uses.
global.TextDecoder = global.TextDecoder || TextDecoder;

const bytesOf = (text) => [...new TextEncoder().encode(text)];

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
const GIF = bytesOf('GIF89a');
const SVG = `<?xml version="1.0"?>
<!-- Generator: a design tool -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 4"><rect width="10" height="4"/></svg>`;
// Older design tools declare entities in the doctype.
const SVG_WITH_DOCTYPE = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [
  <!ENTITY ns_svg "http://www.w3.org/2000/svg">
]>
<svg version="1.1" xmlns="&ns_svg;" viewBox="0 0 10 4"><rect width="10" height="4"/></svg>`;
const HTML_WITH_SVG = `<!doctype html><html><head><title>Not found</title></head>
<body><svg viewBox="0 0 10 10"><circle r="5"/></svg> Page not found</body></html>`;

// A browser that decodes the image to the given size, or fails to. With
// `onStall`, it starts decoding, calls `onStall`, and never finishes.
const decodeAs = ({ width, height, fail = false, onStall }) => {
  global.Image = class {
    set src(value) {
      this.naturalWidth = width;
      this.naturalHeight = height;
      if (onStall) onStall();
      else setTimeout(() => (fail ? this.onerror() : this.onload()));
    }
  };
  const canvas = {
    getContext: () => ({ drawImage: jest.fn() }),
    toDataURL: jest.fn(() => 'data:image/png;base64,CANVAS'),
  };
  const createElement = document.createElement.bind(document);
  jest
    .spyOn(document, 'createElement')
    .mockImplementation((tag) => (tag === 'canvas' ? canvas : createElement(tag)));
  return canvas;
};

describe('loadImage', () => {
  const OriginalImage = global.Image;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    URL.createObjectURL = jest.fn(() => 'blob:image');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
    global.Image = OriginalImage;
  });

  it('returns null without fetching when there is no src', async () => {
    global.fetch = jest.fn();
    await expect(loadImage(null)).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('embeds a PNG as is', async () => {
    global.fetch = serveBytes(PNG);
    await expect(loadImage('https://cdn.example/logo')).resolves.toEqual({
      image: `data:image/png;base64,${bytesToBase64(Uint8Array.from(PNG))}`,
    });
  });

  it('embeds a JPEG as is', async () => {
    global.fetch = serveBytes(JPEG);
    await expect(loadImage('https://cdn.example/logo')).resolves.toEqual({
      image: `data:image/jpeg;base64,${bytesToBase64(Uint8Array.from(JPEG))}`,
    });
  });

  it("returns an SVG as markup for pdfmake's svg node", async () => {
    global.fetch = serveBytes(bytesOf(SVG));
    await expect(loadImage('https://cdn.example/logo')).resolves.toEqual({ svg: SVG });

    global.fetch = serveBytes(bytesOf(SVG_WITH_DOCTYPE));
    await expect(loadImage('https://cdn.example/logo')).resolves.toEqual({ svg: SVG_WITH_DOCTYPE });
  });

  it('does not take an HTML page with an inline svg for an SVG', async () => {
    global.fetch = serveBytes(bytesOf(HTML_WITH_SVG));
    decodeAs({ width: 0, height: 0, fail: true });
    await expect(loadImage('https://cdn.example/logo')).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      '[pdf] image https://cdn.example/logo skipped:',
      "the browser can't read this image",
    );
  });

  it('draws other formats on a canvas, at most 300 x 120 px by default', async () => {
    global.fetch = serveBytes(GIF);
    const canvas = decodeAs({ width: 1200, height: 200 });
    await expect(loadImage('https://cdn.example/logo.gif')).resolves.toEqual({
      image: 'data:image/png;base64,CANVAS',
    });
    expect([canvas.width, canvas.height]).toEqual([300, 50]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image');
  });

  it('draws within the given maximum size', async () => {
    global.fetch = serveBytes(GIF);
    const canvas = decodeAs({ width: 1200, height: 600 });
    await loadImage('https://cdn.example/logo.gif', { maxWidth: 600, maxHeight: 150 });
    expect([canvas.width, canvas.height]).toEqual([300, 150]);
  });

  it('does not enlarge a small image', async () => {
    global.fetch = serveBytes(GIF);
    const canvas = decodeAs({ width: 80, height: 30 });
    await loadImage('https://cdn.example/logo.gif');
    expect([canvas.width, canvas.height]).toEqual([80, 30]);
  });

  it("returns null when the image can't be fetched", async () => {
    global.fetch = serveBytes([], { ok: false, status: 404 });
    await expect(loadImage('https://cdn.example/missing.png')).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      '[pdf] image https://cdn.example/missing.png skipped:',
      'image fetch failed (404)',
    );
  });

  it('shows only the start of a long src in the warning', async () => {
    global.fetch = serveBytes([], { ok: false, status: 400 });
    const src = `data:image/webp;base64,${'A'.repeat(500)}`;
    await loadImage(src);
    expect(console.warn).toHaveBeenCalledWith(
      `[pdf] image ${src.slice(0, 80)}... skipped:`,
      expect.any(String),
    );
  });

  it('stops waiting and returns null after 10 seconds', async () => {
    jest.useFakeTimers();
    try {
      global.fetch = neverAnswers();
      const image = loadImage('https://slow.example/logo.png');
      jest.advanceTimersByTime(10000);
      await expect(image).resolves.toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.any(String),
        "it didn't load within 10 seconds",
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('stops waiting for a decode that never ends after 10 seconds', async () => {
    jest.useFakeTimers();
    try {
      global.fetch = serveBytes(GIF);
      let startDecode;
      const decodeStarted = new Promise((resolve) => {
        startDecode = resolve;
      });
      decodeAs({ width: 80, height: 30, onStall: startDecode });
      const image = loadImage('https://cdn.example/logo.gif');
      await decodeStarted;
      jest.advanceTimersByTime(10000);
      await expect(image).resolves.toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image');
      expect(console.warn).toHaveBeenCalledWith(
        expect.any(String),
        "it didn't load within 10 seconds",
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
