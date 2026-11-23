/* eslint-disable no-magic-numbers */
// File signatures and pixel sizes are data here.
import { bytesToBase64 } from './base64';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const SVG_SNIFF_BYTES = 1024;
const IMAGE_TIMEOUT_MS = 10000;
// The default suits a small image such as a logo: three times a 100 x 40 pt
// box, so it stays sharp in print.
const DEFAULT_MAX_WIDTH = 300;
const DEFAULT_MAX_HEIGHT = 120;
// What may come before an SVG's root element: white space, an XML
// declaration, comments, and a doctype, which can hold entity declarations.
const SVG_PROLOG = /^(?:\s|<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!doctype[^>[]*(?:\[[\s\S]*?\])?\s*>)*/i;

const hasSignature = (bytes, signature) =>
  signature.every((byte, i) => bytes[i] === byte);

// An SVG file starts with an <svg> element, after its prolog. An HTML page
// that holds an inline <svg> starts with <html> instead.
const isSvg = (bytes) => {
  // TextDecoder drops a leading byte order mark.
  const head = new TextDecoder().decode(bytes.subarray(0, SVG_SNIFF_BYTES));
  return /^<svg[\s>]/i.test(head.replace(SVG_PROLOG, ''));
};

// A data: URL can be long, so a warning shows only its start.
const shortened = (src) => (src.length > 80 ? `${src.slice(0, 80)}...` : src);

// `signal` stops a decode that runs past the time limit.
const rasterize = (blob, maxWidth, maxHeight, signal) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    const onAbort = () => {
      img.onload = null;
      img.onerror = null;
      cleanUp();
      reject(new Error('aborted'));
    };
    const cleanUp = () => {
      signal.removeEventListener('abort', onAbort);
      URL.revokeObjectURL(objectUrl);
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
    img.onload = () => {
      try {
        const scale = Math.min(
          1,
          maxWidth / img.naturalWidth,
          maxHeight / img.naturalHeight,
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      } finally {
        cleanUp();
      }
    };
    img.onerror = () => {
      cleanUp();
      reject(new Error("the browser can't read this image"));
    };
    img.src = objectUrl;
  });

/**
 * Load an image, a logo for example, for a pdfmake document.
 *
 * pdfmake's image node reads only PNG and JPEG, and its browser build won't
 * fetch a URL itself (getBlob hangs). So:
 * - PNG and JPEG are embedded as they are.
 * - SVG goes to pdfmake's svg node and prints as vector.
 * - Any other format the browser can show (WebP, GIF, AVIF...) is drawn on a
 *   canvas and embedded as PNG. `maxWidth` and `maxHeight` cap the canvas in
 *   pixels. The default suits a small image such as a logo; pass a bigger
 *   size for a bigger image.
 *
 * The format comes from the file's first bytes, not the Content-Type header,
 * which servers and CDNs often send as a generic type.
 *
 * @param {string} src - http(s) or data: URL
 * @param {object} [options]
 * @param {number} [options.maxWidth=300]
 * @param {number} [options.maxHeight=120]
 * @returns {Promise<{image: string}|{svg: string}|null>} a node to spread into
 *   the document (`{ ...logo, fit: [100, 40] }`), or null when there is no
 *   src, it doesn't load within 10 seconds, or it can't be read
 */
export const loadImage = async (
  src,
  { maxWidth = DEFAULT_MAX_WIDTH, maxHeight = DEFAULT_MAX_HEIGHT } = {},
) => {
  if (!src) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const res = await fetch(src, { signal: controller.signal });
    if (!res.ok) throw new Error(`image fetch failed (${res.status})`);
    const blob = await res.blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (hasSignature(bytes, PNG_SIGNATURE)) {
      return { image: `data:image/png;base64,${bytesToBase64(bytes)}` };
    }
    if (hasSignature(bytes, JPEG_SIGNATURE)) {
      return { image: `data:image/jpeg;base64,${bytesToBase64(bytes)}` };
    }
    if (isSvg(bytes)) return { svg: new TextDecoder().decode(bytes) };
    return { image: await rasterize(blob, maxWidth, maxHeight, controller.signal) };
  } catch (err) {
    const reason = controller.signal.aborted
      ? `it didn't load within ${IMAGE_TIMEOUT_MS / 1000} seconds`
      : err && err.message;
    // eslint-disable-next-line no-console
    console.warn(`[pdf] image ${shortened(src)} skipped:`, reason);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export default loadImage;
