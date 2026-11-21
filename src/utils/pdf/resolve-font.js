/**
 * Load a FontSpec for pdfmake: register its files and read its metrics.
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
 * A font may also give `italics` and `bolditalics`. pdfmake fails a document
 * that uses a style its font has no file for, so a missing style uses the
 * closest one the font has: bold and italics use the regular file, bold
 * italics uses the bold one. A font with no file at all falls back to
 * Helvetica.
 *
 * A URL font also falls back to Helvetica when a file can't be fetched,
 * doesn't download within 10 seconds, isn't a TTF, OTF or WOFF file (an HTML
 * error page, for example), or is cut short. WOFF2 falls back too: pdfmake
 * prints most WOFF2 fonts as blank text, without an error. None of these is
 * cached, so the next document tries the font again.
 */
/* eslint-disable no-magic-numbers */
import { bytesToBase64, base64ToBytes } from './base64';
import { fontFormat, isCompleteFontFile, readFontMetrics } from './font-metrics';

const HELVETICA = 'Helvetica';
const STYLES = ['normal', 'bold', 'italics', 'bolditalics'];
const FONT_TIMEOUT_MS = 10000;

// Adobe's AFM files for Helvetica, Helvetica-Bold, Helvetica-Oblique and
// Helvetica-BoldOblique, which pdfmake ships, give the same Ascender and
// CapHeight for all four: 718 per 1000 units.
const HELVETICA_METRICS = { ascender: 0.718, capHeight: 0.718 };

// Cache resolved URL fonts so repeated prints don't refetch. Keyed by the url
// set; stores the in-flight/resolved { container, fontMetrics } promise.
const fontCache = new Map();

const allStyles = (value) =>
  STYLES.reduce((acc, style) => ({ ...acc, [style]: value }), {});

const helvetica = () => ({ family: HELVETICA, fontMetrics: allStyles(HELVETICA_METRICS) });

// Give every style a file, taken from the closest style the font has.
const fillStyles = (files) => {
  const normal = files.normal || files.bold || files.italics || files.bolditalics;
  const bold = files.bold || normal;
  return {
    normal,
    bold,
    italics: files.italics || normal,
    bolditalics: files.bolditalics || bold,
  };
};

// The metrics only help a template place shapes around text, so a file they
// can't be read from still prints.
const readMetricsOrNull = async (bytes) => {
  try {
    return await readFontMetrics(bytes);
  } catch (err) {
    return null;
  }
};

// A pre-baked container's files are base64 strings in its vfs.
const readVfsMetricsOrNull = async (file) => {
  if (typeof file !== 'string') return null;
  let bytes;
  try {
    bytes = base64ToBytes(file);
  } catch (err) {
    return null;
  }
  return readMetricsOrNull(bytes);
};

// Each style's metrics: those of the file it prints with. `readFile` runs
// once per file, even when several styles share it.
const metricsByStyle = async (files, readFile) => {
  const metricsByFile = {};
  STYLES.forEach((style) => {
    if (!(files[style] in metricsByFile)) metricsByFile[files[style]] = readFile(files[style]);
  });
  const fontMetrics = {};
  await Promise.all(
    STYLES.map(async (style) => {
      fontMetrics[style] = await metricsByFile[files[style]];
    }),
  );
  return fontMetrics;
};

const checkFontFile = (bytes, url) => {
  const format = fontFormat(bytes);
  if (format === 'woff2') {
    throw new Error(`pdfmake prints WOFF2 fonts as blank text, use a TTF, OTF or WOFF file: ${url}`);
  }
  if (!format) throw new Error(`not a TTF, OTF or WOFF file: ${url}`);
  if (!isCompleteFontFile(bytes)) throw new Error(`the font file is cut short or damaged: ${url}`);
};

const fetchFontFile = async (url, signal) => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`font fetch failed (${res.status}): ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  checkFontFile(bytes, url);
  return bytes;
};

// Fetch a URL font's files, each URL once, and build a pdfmake font container
// { vfs, fonts } plus each style's metrics.
const loadUrlFont = async (family, urls) => {
  const styles = fillStyles(urls);
  if (!styles.normal) throw new Error('the font has no file URL');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FONT_TIMEOUT_MS);
  const bytesByUrl = {};
  try {
    await Promise.all(
      [...new Set(STYLES.map((style) => styles[style]))].map(async (url) => {
        bytesByUrl[url] = await fetchFontFile(url, controller.signal);
      }),
    );
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`the font didn't download within ${FONT_TIMEOUT_MS / 1000} seconds`);
    }
    controller.abort(); // the other files aren't needed any more
    throw err;
  } finally {
    clearTimeout(timer);
  }

  // One vfs file per URL, named after the first style that uses it.
  const vfsNameByUrl = {};
  const vfs = {};
  const fonts = { [family]: {} };
  STYLES.forEach((style) => {
    const url = styles[style];
    if (!vfsNameByUrl[url]) {
      vfsNameByUrl[url] = `${family}-${style}.ttf`;
      vfs[vfsNameByUrl[url]] = bytesToBase64(bytesByUrl[url]);
    }
    fonts[family][style] = vfsNameByUrl[url];
  });
  const fontMetrics = await metricsByStyle(styles, (url) => readMetricsOrNull(bytesByUrl[url]));
  return { container: { vfs, fonts }, fontMetrics };
};

/**
 * Load a FontSpec: register it on pdfMake and read its metrics.
 *
 * @param {object} pdfMake - the consumer's pdfmake instance
 * @param {string|object} font - FontSpec
 * @returns {Promise<{family: string, fontMetrics: object}>} the font family to
 *   use as defaultStyle.font, and `fontMetrics.normal`, `.bold`, `.italics`
 *   and `.bolditalics`: each style's `{ ascender, capHeight }` per em, or null
 *   when its file can't be read for them (see readFontMetrics)
 */
export const loadFont = async (pdfMake, font) => {
  if (!font || font === HELVETICA || font.family === HELVETICA) return helvetica();

  // Imported / pre-baked container — no fetch.
  if (font.family && font.vfs && font.fonts) {
    const files = font.fonts[font.family] && fillStyles(font.fonts[font.family]);
    if (!files || !files.normal) {
      // eslint-disable-next-line no-console
      console.warn(`[pdf] font container has no file for "${font.family}", using Helvetica`);
      return helvetica();
    }
    pdfMake.addFontContainer({ vfs: font.vfs, fonts: { ...font.fonts, [font.family]: files } });
    return {
      family: font.family,
      fontMetrics: await metricsByStyle(files, (name) => readVfsMetricsOrNull(font.vfs[name])),
    };
  }

  // Runtime-dynamic URLs — fetch + base64 (cached), fall back on failure.
  if (font.family && font.urls) {
    const key = font.family + '|' + JSON.stringify(font.urls);
    if (!fontCache.has(key)) {
      fontCache.set(
        key,
        loadUrlFont(font.family, font.urls).catch((err) => {
          fontCache.delete(key);
          throw err;
        }),
      );
    }
    try {
      const { container, fontMetrics } = await fontCache.get(key);
      pdfMake.addFontContainer(container);
      return { family: font.family, fontMetrics };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[pdf] font "${font.family}" failed, using Helvetica:`, err && err.message);
      return helvetica();
    }
  }

  return helvetica();
};

/**
 * Resolve a FontSpec and register it on pdfMake.
 *
 * @param {object} pdfMake - the consumer's pdfmake instance
 * @param {string|object} font - FontSpec
 * @returns {Promise<string>} the font family to use as defaultStyle.font
 */
export const resolveFont = async (pdfMake, font) => (await loadFont(pdfMake, font)).family;

export default resolveFont;
