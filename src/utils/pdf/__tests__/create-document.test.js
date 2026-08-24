/**
 * @jest-environment jsdom
 */
import { createDocument } from '../create-document';
import { createFakePdfMake } from '../__fixtures__/fake-pdfmake';

describe('createDocument', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('resolves font, runs the template with it, and sets defaultStyle.font', async () => {
    const { pdfMake } = createFakePdfMake();
    const template = jest.fn((data, ctx) => ({ content: [{ text: data.t }], _ctxFont: ctx.font }));

    const api = await createDocument({ pdfMake, font: 'Helvetica', template, data: { t: 'hi' } });

    expect(template).toHaveBeenCalledWith({ t: 'hi' }, { font: 'Helvetica' });
    const doc = pdfMake.createPdf.mock.calls[0][0];
    expect(doc.defaultStyle.font).toBe('Helvetica');
    expect(typeof api.download).toBe('function');
    expect(typeof api.open).toBe('function');
    expect(typeof api.print).toBe('function');
  });

  it('exposes getBlob / getBase64 as promises', async () => {
    const { pdfMake } = createFakePdfMake();
    const api = await createDocument({ pdfMake, template: () => ({ content: [] }), data: {} });
    await expect(api.getBase64()).resolves.toBe('BASE64');
    await expect(api.getBlob()).resolves.toBeInstanceOf(Blob);
  });

  it('download() pulls a blob and open()/print() delegate to the handle', async () => {
    const { pdfMake, handle } = createFakePdfMake();
    const api = await createDocument({ pdfMake, template: () => ({ content: [] }), data: {} });
    await api.download('receipt.pdf');
    expect(handle.getBlob).toHaveBeenCalled();
    await api.open();
    expect(handle.open).toHaveBeenCalled();
    await api.print();
    expect(handle.print).toHaveBeenCalled();
  });

  it('calls onError and rejects when the template throws', async () => {
    const { pdfMake } = createFakePdfMake();
    const onError = jest.fn();
    const boom = () => { throw new Error('boom'); };
    await expect(
      createDocument({ pdfMake, template: boom, data: {}, onError }),
    ).rejects.toThrow('boom');
    expect(onError).toHaveBeenCalled();
  });
});
