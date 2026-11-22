/**
 * A fake of pdfmake 0.3.x. Like the real one, createPdf(dd).getBlob(),
 * .getBase64(), .open(), .print() and .download() return promises and take
 * no callbacks.
 *
 * Every pdf test that exercises createDocument builds its fake from here. A
 * fake that took callbacks would let a test pass while a real download never
 * starts.
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
