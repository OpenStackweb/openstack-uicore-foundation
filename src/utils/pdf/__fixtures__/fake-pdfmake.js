/**
 * A promise-based fake of pdfmake 0.3.x, matching the REAL contract:
 * createPdf(dd).getBlob() / .getBase64() / .open() / .print() / .download()
 * are all async (return promises) and take NO callbacks. The old 0.1 callback
 * form is gone.
 *
 * Every pdf test that exercises createDocument must build its fake from here, so
 * a hand-rolled fake can't drift back to the callback API and false-green (which
 * is exactly what once hid a real "never downloads" bug — the unit test passed
 * while the browser did nothing).
 *
 * Lives in __fixtures__ (not __tests__) so jest doesn't collect it as a suite.
 *
 * @returns {{ pdfMake: object, handle: object }}
 */
export const createFakePdfMake = () => {
  const handle = {
    getBlob: jest.fn(() => Promise.resolve(new Blob(['%PDF-1.3'], { type: 'application/pdf' }))),
    getBase64: jest.fn(() => Promise.resolve('BASE64')),
    open: jest.fn(() => Promise.resolve()),
    print: jest.fn(() => Promise.resolve()),
    download: jest.fn(() => Promise.resolve()),
  };
  const pdfMake = {
    createPdf: jest.fn(() => handle),
    addFontContainer: jest.fn(),
    addFonts: jest.fn(),
  };
  return { pdfMake, handle };
};

export default createFakePdfMake;
