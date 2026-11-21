/**
 * @jest-environment node
 */
/* eslint-disable no-magic-numbers */
import { bytesToBase64, base64ToBytes } from '../base64';

describe('base64', () => {
  // Longer than one 0x8000-byte chunk, with every byte value.
  const bytes = Uint8Array.from({ length: 0x8000 * 2 + 7 }, (_, i) => i % 256);

  it('encodes bytes the way Node does, across chunks', () => {
    expect(bytesToBase64(bytes)).toBe(Buffer.from(bytes).toString('base64'));
    expect(bytesToBase64(new Uint8Array(0))).toBe('');
  });

  it('encodes only the bytes a view covers', () => {
    const view = bytes.subarray(10, 20);
    expect(bytesToBase64(view)).toBe(Buffer.from(view).toString('base64'));
  });

  it('decodes what it encodes', () => {
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });
});
