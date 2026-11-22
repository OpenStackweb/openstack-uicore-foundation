import { loadFont } from './resolve-font';
import { downloadBlob } from './download-blob';

/**
 * Build a PDF from a pure template and return the output verbs.
 *
 * The consumer passes its own (externalized, shared) `pdfMake` instance so there
 * is one VFS. The `template` is a pure `(data, { font, fontMetrics }) ->
 * docDefinition`; the resolved family is applied to `defaultStyle.font`.
 * `fontMetrics` gives each style's ascender, capital height and text widths
 * (see loadFont). A style's metrics are null when its file can't be read for
 * them, so a template checks before it uses them. Pass `font` and
 * `fontMetrics` to `badge` so its label prints in the document's font.
 * Images referenced by the template must already be base64 `data:` URLs or svg
 * markup (see loadImage) — pdfmake's browser build won't fetch remote images.
 *
 * @param {object}   params.pdfMake  consumer's pdfmake instance
 * @param {*}        params.font     FontSpec (see loadFont); omit for Helvetica
 * @param {Function} params.template (data, { font, fontMetrics }) => docDefinition
 * @param {*}        params.data     payload for the template
 * @param {Function} [params.onError] called when building or outputting the
 *   document fails. A font that can't be loaded doesn't call it: the document
 *   prints in Helvetica instead.
 * @returns {Promise<{download, open, print, getBlob, getBase64}>}
 */
export const createDocument = async ({ pdfMake, font, template, data, onError }) => {
  let handle;
  try {
    const { family, fontMetrics } = await loadFont(pdfMake, font);
    const doc = template(data, { font: family, fontMetrics });
    doc.defaultStyle = { font: family, ...(doc.defaultStyle || {}) };
    handle = pdfMake.createPdf(doc);
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }

  // pdfmake 0.3.x getBlob/getBase64/open/print/download are all async (promise-
  // based) — no callbacks. Wrap each so onError sees any failure.
  const run = (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (onError) onError(err);
      throw err;
    }
  };

  return {
    download: run(async (filename) => {
      const blob = await handle.getBlob();
      downloadBlob(blob, filename);
    }),
    open: run(() => handle.open()),
    print: run(() => handle.print()),
    getBlob: run(() => handle.getBlob()),
    getBase64: run(() => handle.getBase64()),
  };
};

export default createDocument;
