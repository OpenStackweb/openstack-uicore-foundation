/**
 * Resolve a FontSpec into a registered pdfmake font family.
 *
 * pdfmake's browser build won't fetch font URLs itself (getBlob hangs), so a
 * URL font must be fetched + base64'd and registered via addFontContainer. This
 * toolkit bundles no font: the consumer provides one, and anything unusable
 * falls back to `'Helvetica'` (a standard-14 font the consumer must have
 * registered on its pdfMake, e.g. via pdfmake/build/standard-fonts/Helvetica).
 *
 * FontSpec — one of:
 *   'Helvetica'                        standard; nothing registered here
 *   { family, vfs, fonts }             imported/pre-baked base64 container (no fetch)
 *   { family, urls: { normal, bold } } runtime-dynamic; we fetch + base64 + cache
 *
 * @param {object} pdfMake - the consumer's pdfmake instance
 * @param {string|object} font - FontSpec
 * @returns {Promise<string>} the font family to use as defaultStyle.font
 */
const HELVETICA = 'Helvetica';

// Cache resolved URL containers so repeated prints don't refetch. Keyed by the
// url set; stores the in-flight/resolved container promise.
const containerCache = new Map();

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
};

const fetchFontBase64 = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
    return res.arrayBuffer();
  }).then(arrayBufferToBase64);

// Build a pdfmake font container { vfs, fonts } from a set of weight -> URL.
const containerFromUrls = async (family, urls) => {
  const vfs = {};
  const fonts = { [family]: {} };
  await Promise.all(
    Object.keys(urls).map(async (weight) => {
      const file = `${family}-${weight}.ttf`;
      vfs[file] = await fetchFontBase64(urls[weight]);
      fonts[family][weight] = file;
    }),
  );
  return { vfs, fonts };
};

export const resolveFont = async (pdfMake, font) => {
  if (!font || font === HELVETICA || font.family === HELVETICA) return HELVETICA;

  // Imported / pre-baked container — no fetch.
  if (font.family && font.vfs && font.fonts) {
    pdfMake.addFontContainer({ vfs: font.vfs, fonts: font.fonts });
    return font.family;
  }

  // Runtime-dynamic URLs — fetch + base64 (cached), fall back on failure.
  if (font.family && font.urls) {
    const key = font.family + '|' + JSON.stringify(font.urls);
    if (!containerCache.has(key)) {
      containerCache.set(
        key,
        containerFromUrls(font.family, font.urls).catch((err) => {
          containerCache.delete(key);
          throw err;
        }),
      );
    }
    try {
      const container = await containerCache.get(key);
      pdfMake.addFontContainer(container);
      return font.family;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[pdf] custom font failed, using Helvetica:', err && err.message);
      return HELVETICA;
    }
  }

  return HELVETICA;
};

export default resolveFont;
