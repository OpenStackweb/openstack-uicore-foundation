/**
 * Shared pdfmake node builders for the PDF toolkit. Pure functions that return
 * plain pdfmake docDefinition nodes (no pdfMake instance needed) — so callers
 * can spread-override, compose, or post-process the result. Each carries an
 * opinionated default and a trailing `opts` with a `...rest` passthrough onto
 * the returned node for one-off overrides.
 */

/**
 * A label-over-value pair. Returns `[labelNode, valueNode]` so a caller can
 * spread it into a stack (several fields in a column) or wrap it in one
 * (`{ stack: field(...) }`).
 *
 * @param {string} label
 * @param {string|number} value
 * @param {object} [opts] - { bold=true, gap=8, labelColor } + rest spread onto the value node
 */
export const field = (label, value, opts = {}) => {
  const { bold = true, gap = 8, labelColor = '#777777', ...rest } = opts;
  return [
    {
      text: label == null ? '' : String(label),
      fontSize: 8,
      color: labelColor,
      characterSpacing: 0.4,
      margin: [0, 0, 0, 2],
    },
    { text: value == null ? '' : String(value), fontSize: 10, bold, margin: [0, 0, 0, gap], ...rest },
  ];
};

/**
 * A colored badge with a centered label, drawn as an inline SVG (rounded rect +
 * `text-anchor="middle"`). SVG is used because pdfmake `canvas` can't hold text
 * and a `background:` can't be rounded; the SVG centers the label natively.
 * Always returns a standalone `{ svg, width }` node. Height and horizontal
 * padding derive from `fontSize`; the label is Helvetica-bold (always
 * registered) regardless of the body font.
 *
 * @param {string} text
 * @param {object} [opts] - { color, textColor='#fff', fontSize=9, radius, padX } + rest spread onto the node.
 *   `radius` behaves like CSS `border-radius`: it is clamped to half the height,
 *   so a large value (or the default) gives a full pill, `0` gives a square chip,
 *   and anything between gives rounded corners.
 */
// Escape the five XML-significant characters so live data (tag names like
// "AI & ML") can't break the SVG markup — an unescaped "&" yields invalid SVG
// that pdfmake's parser drops. Safe for both text content and attribute values.
const escapeXml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const badge = (text, opts = {}) => {
  const { color = '#0a7a2f', textColor = '#ffffff', fontSize = 9, radius = 999, padX, ...rest } = opts;
  const label = text == null ? '' : String(text);
  const h = Math.round(fontSize * 1.9);
  const rx = Math.max(0, Math.min(radius, h / 2)); // CSS-like border-radius, clamped to a full pill
  const px = padX != null ? padX : Math.round(fontSize * 1.2);
  const w = Math.ceil(label.length * fontSize * 0.62) + px * 2; // size from the raw length, not the escaped one
  const y = h / 2 + fontSize * 0.34; // baseline that vertically centers the label
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" fill="${escapeXml(color)}"/>` +
    `<text x="${w / 2}" y="${y}" fill="${escapeXml(textColor)}" font-family="Helvetica" font-size="${fontSize}" ` +
    `font-weight="bold" text-anchor="middle">${escapeXml(label)}</text>` +
    `</svg>`;
  return { svg, width: w, ...rest };
};
