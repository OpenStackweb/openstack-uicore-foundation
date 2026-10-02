/**
 * Trigger a browser download of a Blob under a chosen filename.
 *
 * The anchor is created in the light DOM (document.body). Widgets that render
 * inside a shadow root can't use an <a download> there — Chrome ignores the
 * `download` filename for a shadow-tree anchor and saves the blob UUID with no
 * extension. Attaching to the top-level document.body makes Chrome honor the
 * filename. Call synchronously from a user gesture so the download keeps it.
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadBlob = (blob, filename) => {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Defer cleanup so the browser reads the blob + download attribute before
    // the anchor is removed. Removing it synchronously can make Chrome fall
    // back to the blob-UUID filename.
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[pdf] download failed', err);
  }
};

export default downloadBlob;
