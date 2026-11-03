import { field, badge } from '../nodes';

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
});
