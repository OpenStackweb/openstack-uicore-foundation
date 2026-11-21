// String.fromCharCode takes the bytes as arguments, and a whole font file is
// more arguments than a browser allows, so the bytes go in chunks.
const CHUNK = 0x8000;

/**
 * @param {Uint8Array} bytes
 * @returns {string} base64
 */
export const bytesToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
};

/**
 * @param {string} base64
 * @returns {Uint8Array}
 */
export const base64ToBytes = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};
