/**
 * @jest-environment jsdom
 */
import { downloadBlob } from '../download-blob';

describe('downloadBlob', () => {
  let anchor;
  let clicked;

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    anchor = null;
    clicked = null;
    const realCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreate(tag);
      if (tag === 'a') {
        anchor = el;
        jest.spyOn(el, 'click').mockImplementation(function () {
          clicked = { download: this.download, href: this.href, inLightDom: document.body.contains(this) };
        });
      }
      return el;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('clicks a light-DOM <a download=filename> pointing at the blob URL', () => {
    downloadBlob(new Blob(['%PDF']), 'file.pdf');
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clicked.download).toBe('file.pdf');
    expect(clicked.href).toContain('blob:mock');
    expect(clicked.inLightDom).toBe(true);
  });

  it('defers cleanup (anchor not removed synchronously with the click)', () => {
    downloadBlob(new Blob(['%PDF']), 'file.pdf');
    expect(document.body.contains(anchor)).toBe(true);
  });
});
