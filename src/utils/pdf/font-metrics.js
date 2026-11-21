/* eslint-disable no-magic-numbers */
// The byte offsets, table versions and units below come from the OpenType and
// WOFF specs.

// The first four bytes of each font format.
const SFNT_VERSIONS = [
  0x00010000, // TrueType
  0x4f54544f, // "OTTO", OpenType with CFF outlines
  0x74727565, // "true", older Apple TrueType
];
const WOFF_SIGNATURE = 0x774f4646; // "wOFF"
const WOFF2_SIGNATURE = 0x774f4632; // "wOF2"
const CAPITAL_H = 0x48;

const viewOf = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

const tagAt = (view, offset) =>
  String.fromCharCode(...[0, 1, 2, 3].map((i) => view.getUint8(offset + i)));

/**
 * Tell a font file's format from its first four bytes.
 *
 * @param {Uint8Array} bytes
 * @returns {'sfnt'|'woff'|'woff2'|null} 'sfnt' is a TTF or OTF file; null is
 *   anything else, such as an HTML page or a font collection
 */
export const fontFormat = (bytes) => {
  if (bytes.length < 4) return null;
  const signature = viewOf(bytes).getUint32(0);
  if (SFNT_VERSIONS.includes(signature)) return 'sfnt';
  if (signature === WOFF_SIGNATURE) return 'woff';
  if (signature === WOFF2_SIGNATURE) return 'woff2';
  return null;
};

// Where each table sits in a TTF, OTF or WOFF file, by tag: its offset and
// the bytes it takes in the file. A WOFF table also gives its size once
// inflated. Throws when the file ends inside the directory.
const tableDirectory = (view, format) => {
  const entries = {};
  if (format === 'sfnt') {
    const numTables = view.getUint16(4);
    for (let i = 0; i < numTables; i++) {
      const record = 12 + i * 16;
      entries[tagAt(view, record)] = {
        offset: view.getUint32(record + 8),
        length: view.getUint32(record + 12),
      };
    }
  } else {
    const numTables = view.getUint16(12);
    for (let i = 0; i < numTables; i++) {
      const entry = 44 + i * 20;
      entries[tagAt(view, entry)] = {
        offset: view.getUint32(entry + 4),
        length: view.getUint32(entry + 8),
        origLength: view.getUint32(entry + 12),
      };
    }
  }
  return entries;
};

/**
 * Whether every table of a TTF, OTF or WOFF file lies inside the file. A file
 * cut short, or with a damaged table directory, fails this and would fail
 * pdfmake when it prints.
 *
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export const isCompleteFontFile = (bytes) => {
  const format = fontFormat(bytes);
  if (format !== 'sfnt' && format !== 'woff') return false;
  let entries;
  try {
    entries = tableDirectory(viewOf(bytes), format);
  } catch (err) {
    return false;
  }
  return Object.keys(entries).every((tag) =>
    entries[tag].offset + entries[tag].length <= bytes.length);
};

const inflate = async (data) => {
  const stream = new Blob([data])
    .stream()
    .pipeThrough(new DecompressionStream('deflate'));
  return new DataView(await new Response(stream).arrayBuffer());
};

// Returns a function that gives a table's DataView by tag. A TTF or OTF file
// stores its tables as they are. A WOFF file compresses each table with zlib,
// unless that doesn't make it smaller; only the tables asked for are inflated.
const fontTables = (bytes) => {
  const format = fontFormat(bytes);
  const woff = format === 'woff';
  if (format !== 'sfnt' && !(woff && typeof DecompressionStream !== 'undefined')) {
    return null;
  }
  const view = viewOf(bytes);
  const entries = tableDirectory(view, format);
  return async (tag) => {
    const table = entries[tag];
    if (!table) return undefined;
    const data = new DataView(view.buffer, view.byteOffset + table.offset, table.length);
    return woff && table.length < table.origLength ? inflate(data) : data;
  };
};

// Look up a character's glyph id in a Unicode format 4 cmap subtable.
const glyphId = (cmap, code) => {
  const numSubtables = cmap.getUint16(2);
  for (let i = 0; i < numSubtables; i++) {
    const record = 4 + i * 8;
    const platform = cmap.getUint16(record);
    const encoding = cmap.getUint16(record + 2);
    const subtable = cmap.getUint32(record + 4);
    const unicode = platform === 0 || (platform === 3 && encoding === 1);
    if (unicode && cmap.getUint16(subtable) === 4) {
      const segCountX2 = cmap.getUint16(subtable + 6);
      const endCodes = subtable + 14;
      const startCodes = endCodes + segCountX2 + 2;
      const idDeltas = startCodes + segCountX2;
      const idRangeOffsets = idDeltas + segCountX2;
      for (let seg = 0; seg < segCountX2; seg += 2) {
        if (code <= cmap.getUint16(endCodes + seg)) {
          const start = cmap.getUint16(startCodes + seg);
          if (code < start) return 0;
          const delta = cmap.getUint16(idDeltas + seg);
          const rangeOffset = cmap.getUint16(idRangeOffsets + seg);
          // Glyph ids wrap around at 65536.
          if (rangeOffset === 0) return (code + delta) % 0x10000;
          const id = cmap.getUint16(
            idRangeOffsets + seg + rangeOffset + (code - start) * 2,
          );
          return id === 0 ? 0 : (id + delta) % 0x10000;
        }
      }
    }
  }
  return 0;
};

// The top of the "H" glyph's outline, in font units. Only TrueType outlines
// (the glyf table) are read.
const capitalHTop = async (table, head) => {
  const [cmap, loca, glyf] = await Promise.all([
    table('cmap'),
    table('loca'),
    table('glyf'),
  ]);
  if (!cmap || !loca || !glyf) return null;
  const id = glyphId(cmap, CAPITAL_H);
  if (!id) return null;
  const longOffsets = head.getInt16(50) === 1;
  const offsetOf = (i) =>
    longOffsets ? loca.getUint32(i * 4) : loca.getUint16(i * 2) * 2;
  const offset = offsetOf(id);
  if (offsetOf(id + 1) === offset) return null; // a glyph with no outline
  return glyf.getInt16(offset + 8); // yMax
};

/**
 * Read a font's ascender and capital height, per em, from a TTF, OTF or WOFF
 * file.
 *
 * pdfmake puts a line's baseline one ascender below the top of the line, and
 * takes the ascender from the hhea table. Fonts differ a lot here, so text
 * sits at a different height in its line in each font. A template that draws
 * shapes around text (a pill behind a title, for example) needs these to
 * line the two up.
 *
 * The capital height comes from the OS/2 table. Fonts whose OS/2 table is too
 * old to have it get the height of their "H" glyph instead.
 *
 * @param {Uint8Array} bytes - a TTF, OTF or WOFF file
 * @returns {Promise<{ascender: number, capHeight: number}|null>} null for
 *   other formats, for WOFF in a browser that can't inflate it, or when a
 *   value can't be found. It rejects for a damaged file.
 */
export const readFontMetrics = async (bytes) => {
  const table = fontTables(bytes);
  if (!table) return null;

  const [head, hhea, os2] = await Promise.all([
    table('head'),
    table('hhea'),
    table('OS/2'),
  ]);
  if (!head || !hhea) return null;
  const unitsPerEm = head.getUint16(18);
  if (!unitsPerEm) return null;

  // OS/2 has sCapHeight from version 2.
  let capHeight = os2 && os2.getUint16(0) >= 2 ? os2.getInt16(88) : 0;
  if (capHeight <= 0) capHeight = (await capitalHTop(table, head)) || 0;
  if (capHeight <= 0) return null;

  return {
    ascender: hhea.getInt16(4) / unitsPerEm,
    capHeight: capHeight / unitsPerEm,
  };
};

export default readFontMetrics;
