/* eslint-disable no-magic-numbers */
// Font files built byte by byte, at their OpenType and WOFF offsets.
import { deflateSync } from 'zlib';

// A table of `size` bytes, filled in by `write`.
const table = (size, write) => {
  const bytes = new Uint8Array(size);
  write(new DataView(bytes.buffer));
  return bytes;
};
const head = (unitsPerEm) => table(54, (v) => v.setUint16(18, unitsPerEm));
const hhea = (ascender, numberOfHMetrics = 0) =>
  table(36, (v) => {
    v.setInt16(4, ascender);
    v.setUint16(34, numberOfHMetrics);
  });
const os2 = (version, capHeight) =>
  table(96, (v) => {
    v.setUint16(0, version);
    v.setInt16(88, capHeight);
  });
// A Unicode format 4 cmap with one segment per character, mapping each
// character to its glyph id: { H: 1 }. The closing 0xFFFF segment maps to 0.
const cmap = (glyphs) => {
  const codes = Object.keys(glyphs).map((char) => char.charCodeAt(0));
  codes.sort((a, b) => a - b);
  const segments = [...codes, 0xffff];
  const endCodes = 26;
  const startCodes = endCodes + segments.length * 2 + 2;
  const idDeltas = startCodes + segments.length * 2;
  return table(idDeltas + segments.length * 4, (v) => {
    v.setUint16(2, 1); // one subtable
    v.setUint16(4, 3); // platform: Windows
    v.setUint16(6, 1); // encoding: Unicode BMP
    v.setUint32(8, 12); // subtable offset
    v.setUint16(12, 4); // format 4
    v.setUint16(18, segments.length * 2);
    segments.forEach((code, i) => {
      const id = code === 0xffff ? 0 : glyphs[String.fromCharCode(code)];
      v.setUint16(endCodes + i * 2, code);
      v.setUint16(startCodes + i * 2, code);
      v.setUint16(idDeltas + i * 2, (0x10000 + id - code) % 0x10000); // id - code, wrapped
    });
  });
};
// Advance widths, one per glyph id, as hmtx stores them (each with a left side
// bearing of 0).
const hmtx = (advances) =>
  table(advances.length * 4, (v) => advances.forEach((advance, i) => v.setUint16(i * 4, advance)));
// Short loca offsets: glyph 0 is empty, glyph 1 takes 12 bytes.
const loca = () => table(6, (v) => v.setUint16(4, 6));
const glyf = (yMax) => table(12, (v) => v.setInt16(8, yMax));

// A font with a cap height in OS/2, and one that needs the "H" glyph.
export const modernTables = () => ({
  head: head(2048),
  hhea: hhea(2070),
  'OS/2': os2(4, 1434),
});
export const oldTables = () => ({
  head: head(1000),
  hhea: hhea(1011),
  'OS/2': os2(1, 0),
  cmap: cmap({ H: 1 }),
  loca: loca(),
  glyf: glyf(705),
});
// A font with text widths: glyph 0 is 500 units wide, "A" 600 and "B" 700.
// hmtx lists three advance widths, so the space (glyph 3) takes the last one.
export const widthTables = () => ({
  head: head(1000),
  hhea: hhea(900, 3),
  'OS/2': os2(4, 700),
  cmap: cmap({ A: 1, B: 2, ' ': 3 }),
  hmtx: hmtx([500, 600, 700]),
});
export const MODERN = { ascender: 2070 / 2048, capHeight: 1434 / 2048 };
export const OLD = { ascender: 1.011, capHeight: 0.705 };

// Lay out a file: a header, one directory entry per table, then the tables.
const pack = (tables, headerSize, entrySize, writeHeader, writeEntry) => {
  const tags = Object.keys(tables);
  let end = headerSize + tags.length * entrySize;
  const offsets = tags.map((tag) => {
    const offset = end;
    end += tables[tag].length;
    return offset;
  });
  const bytes = new Uint8Array(end);
  const view = new DataView(bytes.buffer);
  writeHeader(view, tags.length, end);
  tags.forEach((tag, i) => {
    const entry = headerSize + i * entrySize;
    for (let c = 0; c < 4; c++) bytes[entry + c] = tag.charCodeAt(c);
    writeEntry(view, entry, tag, offsets[i]);
    bytes.set(tables[tag], offsets[i]);
  });
  return bytes;
};

// A TTF file, or an OTF one with version 0x4f54544f ("OTTO").
export const ttf = (tables, version = 0x00010000) =>
  pack(
    tables,
    12,
    16,
    (view, numTables) => {
      view.setUint32(0, version);
      view.setUint16(4, numTables);
    },
    (view, entry, tag, offset) => {
      view.setUint32(entry + 8, offset);
      view.setUint32(entry + 12, tables[tag].length);
    },
  );

// A WOFF file. Each table is compressed with zlib, unless that doesn't make
// it smaller: then it is stored as it is, as WOFF requires. The tiny loca and
// glyf tables here are stored that way.
export const woff = (tables) => {
  const stored = {};
  Object.keys(tables).forEach((tag) => {
    const packed = new Uint8Array(deflateSync(tables[tag]));
    stored[tag] = packed.length < tables[tag].length ? packed : tables[tag];
  });
  return pack(
    stored,
    44,
    20,
    (view, numTables, length) => {
      view.setUint32(0, 0x774f4646); // "wOFF"
      view.setUint32(4, 0x00010000);
      view.setUint32(8, length);
      view.setUint16(12, numTables);
    },
    (view, entry, tag, offset) => {
      view.setUint32(entry + 4, offset);
      view.setUint32(entry + 8, stored[tag].length);
      view.setUint32(entry + 12, tables[tag].length);
    },
  );
};

// The first bytes of a WOFF2 file; enough for a signature check.
export const woff2 = () => Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 0, 1, 0, 0]);
