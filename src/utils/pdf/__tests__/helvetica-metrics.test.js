/* eslint-disable no-magic-numbers */
import { HELVETICA_FONT_METRICS } from '../helvetica-metrics';

const { normal, bold, italics, bolditalics } = HELVETICA_FONT_METRICS;

describe('HELVETICA_FONT_METRICS', () => {
  it("gives every style Helvetica's ascender and cap height", () => {
    [normal, bold, italics, bolditalics].forEach((style) => {
      expect(style).toMatchObject({ ascender: 0.718, capHeight: 0.718 });
    });
  });

  it('measures text with the widths of the AFM files', () => {
    expect(bold.textWidth('PAID')).toBeCloseTo((667 + 722 + 278 + 722) / 1000);
    expect(bold.textWidth('WM')).toBeCloseTo((944 + 833) / 1000);
    expect(normal.textWidth('il')).toBeCloseTo((222 + 222) / 1000);
    expect(bold.textWidth('')).toBe(0);
  });

  it('measures Windows-1252 characters outside ASCII', () => {
    expect(bold.textWidth('é')).toBeCloseTo(0.556); // é
    expect(bold.textWidth('€')).toBeCloseTo(0.556); // €, at 0x80
    expect(normal.textWidth('—')).toBeCloseTo(1); // em dash, at 0x97
  });

  it('counts a character Helvetica has no glyph for as an average letter', () => {
    expect(bold.textWidth('日')).toBeCloseTo(0.6);
  });

  it('gives the oblique styles the widths of the upright ones', () => {
    expect(italics).toBe(normal);
    expect(bolditalics).toBe(bold);
  });
});
