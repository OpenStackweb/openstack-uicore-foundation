/* eslint-disable no-magic-numbers */
import { field, badge } from '../nodes';
import { HELVETICA_FONT_METRICS } from '../helvetica-metrics';

describe('field', () => {
  it('returns a [label, value] pair with an opinionated default (bold value)', () => {
    const [label, value] = field('Document Number', 'ORD-1');
    expect(label).toMatchObject({ text: 'Document Number', fontSize: 8, color: '#777777' });
    expect(value).toMatchObject({ text: 'ORD-1', fontSize: 10, bold: true });
  });

  it('honors opts (bold, gap, labelColor) and spreads rest onto the value node', () => {
    const [label, value] = field('VENUE:', 'Main Hall', { bold: false, gap: 0, labelColor: '#999', alignment: 'center' });
    expect(label.color).toBe('#999');
    expect(value).toMatchObject({ text: 'Main Hall', bold: false, margin: [0, 0, 0, 0], alignment: 'center' });
  });

  it('coerces nullish label/value to empty strings', () => {
    const [label, value] = field(null, undefined);
    expect(label.text).toBe('');
    expect(value.text).toBe('');
  });
});

describe('badge', () => {
  it('defaults to a full pill (radius clamped to half-height) with the label centered', () => {
    const b = badge('PAID', { color: '#0a7a2f' });
    expect(b.svg).toContain('<rect');
    expect(b.svg).toContain('rx="8.5"'); // clamped to h/2 (17/2) → full pill
    expect(b.svg).toContain('fill="#0a7a2f"');
    expect(b.svg).toContain('text-anchor="middle"');
    expect(b.svg).toContain('>PAID<');
    expect(typeof b.width).toBe('number');
  });

  it('radius behaves like CSS border-radius: 0 = square, in-between = rounded, clamped = pill', () => {
    expect(badge('DEVOPS', { radius: 0, color: '#F6F6F6', textColor: '#4A4A4A', fontSize: 6 }).svg).toContain('rx="0"');
    expect(badge('T', { radius: 3 }).svg).toContain('rx="3"');
    expect(badge('T', { radius: 999 }).svg).toContain('rx="8.5"'); // clamped to h/2
    const chip = badge('DEVOPS', { radius: 0, textColor: '#4A4A4A', fontSize: 6 });
    expect(chip.svg).toContain('fill="#4A4A4A"');
    expect(chip.svg).toContain('font-size="6"');
  });

  it('XML-escapes the label and colors so live data cannot break the SVG', () => {
    const b = badge('AI & ML <all>', { color: '#fff', textColor: '"x"' });
    expect(b.svg).toContain('>AI &amp; ML &lt;all&gt;<');
    expect(b.svg).not.toMatch(/>AI & ML/); // raw ampersand would be invalid SVG
    expect(b.svg).toContain('fill="&quot;x&quot;"');
  });

  it('spreads rest onto the returned node (e.g. an alignment margin)', () => {
    const b = badge('PAID', { color: '#0a7a2f', margin: [0, -2, 0, 0] });
    expect(b.margin).toEqual([0, -2, 0, 0]);
  });

  it('draws the same badge as before without font or fontMetrics', () => {
    expect(badge('PAID')).toEqual({
      svg:
        '<svg xmlns="http://www.w3.org/2000/svg" width="45" height="17">' +
        '<rect x="0" y="0" width="45" height="17" rx="8.5" fill="#0a7a2f"/>' +
        '<text x="22.5" y="11.56" fill="#ffffff" font-family="Helvetica" font-size="9" ' +
        'font-weight="bold" text-anchor="middle">PAID</text></svg>',
      width: 45,
    });
  });

  it('prints the label in the given font', () => {
    expect(badge('PAID', { font: 'Roboto' }).svg).toContain('font-family="Roboto"');
    expect(badge('PAID', { font: 'A & "B"' }).svg).toContain('font-family="A &amp; &quot;B&quot;"');
  });

  it("fits the label's measured width and centers its capitals with fontMetrics", () => {
    const fontMetrics = {
      normal: { ascender: 1, capHeight: 0.5, textWidth: () => 99 },
      bold: { ascender: 0.9, capHeight: 0.7, textWidth: (text) => text.length * 0.5 },
    };
    const b = badge('PAID', { fontSize: 10, padX: 4, fontMetrics });
    // 4 letters of 0.5 em at 10 pt, plus 4 pt of padding on each side; the bold style.
    expect(b.width).toBe(28);
    // Half the height (19 / 2) plus half the capital height (0.7 * 10 / 2).
    expect(b.svg).toContain('y="13"');
  });

  it('fits a label of wide capitals with Helvetica metrics, where the estimate is too narrow', () => {
    const label = 'MMMMMMMMMMMM';
    const estimated = badge(label, { fontSize: 6 }).width;
    const measured = badge(label, { fontSize: 6, font: 'Helvetica', fontMetrics: HELVETICA_FONT_METRICS });
    expect(estimated).toBe(59); // 45 for the label, which needs 60
    expect(measured.width).toBe(Math.ceil(12 * 0.833 * 6) + 14);
  });

  it('estimates the width without the bold metrics or their textWidth', () => {
    const estimated = badge('PAID');
    expect(badge('PAID', { fontMetrics: { bold: null } })).toEqual(estimated);
    const noWidths = badge('PAID', { fontMetrics: { bold: { ascender: 0.9, capHeight: 0.7 } } });
    expect(noWidths.width).toBe(estimated.width);
    expect(noWidths.svg).toContain(`y="${17 / 2 + (9 * 0.7) / 2}"`);
  });

  it('keeps font and fontMetrics off the returned node', () => {
    const b = badge('PAID', { font: 'Roboto', fontMetrics: HELVETICA_FONT_METRICS });
    expect(Object.keys(b)).toEqual(['svg', 'width']);
  });
});

