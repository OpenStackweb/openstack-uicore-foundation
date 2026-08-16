/**
 * Resolve an image source to a base64 `data:` URL for pdfmake.
 *
 * pdfmake's browser build won't fetch image URLs itself (getBlob hangs on a
 * remote image), so any http(s) logo must be fetched and base64'd first. A value
 * that is already a `data:` URL (e.g. a bundled/imported asset) is returned
 * unchanged. Results are cached (and in-flight deduped) by source.
 *
 * @param {string} src - http(s) URL or an existing data: URL
 * @returns {Promise<string|null>} data: URL, or null for a falsy src
 */
const cache = new Map();

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });

export const imageDataUrl = (src) => {
  if (!src) return Promise.resolve(null);
  if (src.indexOf('data:') === 0) return Promise.resolve(src);
  if (cache.has(src)) return cache.get(src);

  const p = fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error(`image fetch failed: ${res.status}`);
      return res.blob();
    })
    .then(blobToDataUrl);

  cache.set(src, p);
  p.catch(() => cache.delete(src)); // don't cache failures
  return p;
};

export default imageDataUrl;
