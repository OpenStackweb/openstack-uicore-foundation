/* eslint-disable no-magic-numbers */
// Helvetica's metrics, as pdfmake prints its standard Helvetica fonts. The
// values come from Adobe's AFM files for Helvetica, Helvetica-Bold,
// Helvetica-Oblique and Helvetica-BoldOblique, which pdfmake ships.

// All four fonts have an Ascender and CapHeight of 718 per 1000 units.
const ASCENDER = 0.718;
const CAP_HEIGHT = 0.718;

// pdfmake writes Helvetica text in the Windows-1252 encoding. These are the
// characters that encoding moves into the bytes 0x80 to 0x9F. Any other
// character above 0xFF has no Helvetica glyph.
const WIN_ANSI = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

// Each byte's width per 1000 units, from 0x20 to 0xFF. 0 is a byte with no
// glyph. The oblique fonts have the same widths as the upright ones.
const REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, // 0x20
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, // 0x30
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, // 0x40
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, // 0x50
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, // 0x60
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 0, // 0x70
  556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, // 0x80
  0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 500, // 0x90
  278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, // 0xA0
  400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, // 0xB0
  667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, // 0xC0
  722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, // 0xD0
  556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, // 0xE0
  556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500, // 0xF0
];
const BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, // 0x20
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, // 0x30
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, // 0x40
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, // 0x50
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, // 0x60
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 0, // 0x70
  556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, // 0x80
  0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 556, // 0x90
  278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, // 0xA0
  400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, // 0xB0
  722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, // 0xC0
  722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, // 0xD0
  556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, // 0xE0
  611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556, // 0xF0
];

// pdfmake prints a character Helvetica has no glyph for as stray letters. It
// counts as an average letter here, so it still takes up some room.
const NO_GLYPH_WIDTH = 0.6;

// A text's width per em, from a width table above. Kerning isn't counted, so
// the result can be a little wider than the printed text.
const textWidthIn = (widths) => (text) => {
  let width = 0;
  for (const char of String(text)) {
    const code = char.codePointAt(0);
    const byte = WIN_ANSI[code] || code;
    const glyphWidth = byte >= 0x20 && byte <= 0xff ? widths[byte - 0x20] : 0;
    width += glyphWidth ? glyphWidth / 1000 : NO_GLYPH_WIDTH;
  }
  return width;
};

const regular = { ascender: ASCENDER, capHeight: CAP_HEIGHT, textWidth: textWidthIn(REGULAR) };
const bold = { ascender: ASCENDER, capHeight: CAP_HEIGHT, textWidth: textWidthIn(BOLD) };

// Helvetica's metrics for each style, in the shape loadFont gives them.
export const HELVETICA_FONT_METRICS = {
  normal: regular,
  bold,
  italics: regular,
  bolditalics: bold,
};

export default HELVETICA_FONT_METRICS;
