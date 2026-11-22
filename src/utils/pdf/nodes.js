/**
 * Shared pdfmake node builders for the PDF toolkit. A node is one item of a
 * pdfmake docDefinition: a text, an svg, a table, a set of columns. These are
 * pure functions that return plain nodes (no pdfMake instance needed) — so callers
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

// Without font metrics, a badge sizes its label as letters this wide (an
// average Helvetica Bold letter, per em) and puts the baseline this far below
// its middle (per em), which centers a Helvetica label.
const AVERAGE_LETTER_WIDTH = 0.62;
const BASELINE_BELOW_MIDDLE = 0.34;

/**
 * A colored badge with a centered bold label, drawn as an inline SVG (rounded
 * rect + `text-anchor="middle"`). SVG is used because pdfmake `canvas` can't
 * hold text and a `background:` can't be rounded; the SVG centers the label
 * natively. Always returns a standalone `{ svg, width }` node. Height and
 * horizontal padding derive from `fontSize`.
 *
 * The label prints in `font`, Helvetica by default. With `fontMetrics`, the
 * badge is as wide as the label measures and centers its capital letters.
 * Without them, the width is estimated from the number of letters. A template
 * passes both from its context:
 * `badge(text, { font: ctx.font, fontMetrics: ctx.fontMetrics })`.
 *
 * @param {string} text
 * @param {object} [opts] - { color, textColor='#fff', fontSize=9, radius, padX,
 *   font, fontMetrics } + rest spread onto the node.
 *   `radius` behaves like CSS `border-radius`: it is clamped to half the height,
 *   so a large value (or the default) gives a full pill, `0` gives a square chip,
 *   and anything between gives rounded corners.
 *   `font` is a font family registered on pdfMake, such as the template's
 *   `font`. `fontMetrics` are that font's metrics, as the template gets them
 *   (see loadFont); the badge uses the bold style's.
 */
export const badge = (text, opts = {}) => {
  const {
    color = '#0a7a2f',
    textColor = '#ffffff',
    fontSize = 9,
    radius = 999,
    padX,
    font,
    fontMetrics,
    ...rest
  } = opts;
  const label = text == null ? '' : String(text);
  const metrics = fontMetrics && fontMetrics.bold;
  const h = Math.round(fontSize * 1.9);
  const rx = Math.max(0, Math.min(radius, h / 2)); // CSS-like border-radius, clamped to a full pill
  const px = padX != null ? padX : Math.round(fontSize * 1.2);
  // Size from the raw label, not the escaped one.
  const textWidth = metrics && metrics.textWidth
    ? Math.ceil(metrics.textWidth(label) * fontSize)
    : Math.ceil(label.length * fontSize * AVERAGE_LETTER_WIDTH);
  const w = textWidth + px * 2;
  // The baseline sits half a capital height below the middle, so capital
  // letters are centered.
  const y = metrics
    ? h / 2 + (fontSize * metrics.capHeight) / 2
    : h / 2 + fontSize * BASELINE_BELOW_MIDDLE;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" fill="${escapeXml(color)}"/>` +
    `<text x="${w / 2}" y="${y}" fill="${escapeXml(textColor)}" font-family="${escapeXml(font || 'Helvetica')}" ` +
    `font-size="${fontSize}" font-weight="bold" text-anchor="middle">${escapeXml(label)}</text>` +
    `</svg>`;
  return { svg, width: w, ...rest };
};
