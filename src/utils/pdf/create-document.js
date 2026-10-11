import { resolveFont } from './resolve-font';
import { downloadBlob } from './download-blob';

/**
 * Build a PDF from a pure template and return the output verbs.
 *
 * The consumer passes its own (externalized, shared) `pdfMake` instance so there
 * is one VFS. The `template` is a pure `(data, { font }) -> docDefinition`; the
 * resolved family is applied to `defaultStyle.font`. Images referenced by the
 * template must already be base64 `data:` URLs (see imageDataUrl) — pdfmake's
 * browser build won't fetch remote images.
 *
 * @param {object}   params.pdfMake  consumer's pdfmake instance
 * @param {*}        params.font     FontSpec (see resolveFont); omit for Helvetica
 * @param {Function} params.template (data, { font }) => docDefinition
 * @param {*}        params.data     payload for the template
 * @param {Function} [params.onError] called on any build/fetch/layout failure
 * @returns {Promise<{download, open, print, getBlob, getBase64}>}
 */
export const createDocument = async ({ pdfMake, font, template, data, onError }) => {
  let handle;
  try {
    const family = await resolveFont(pdfMake, font);
    const doc = template(data, { font: family });
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
