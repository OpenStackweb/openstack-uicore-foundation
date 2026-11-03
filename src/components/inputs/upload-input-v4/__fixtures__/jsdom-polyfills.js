/**
 * jsdom has no TextEncoder/TextDecoder, and @uppy/aws-s3 builds one at module load
 * (lib/createSignedURL.js). Import this before anything that imports Uppy: ES imports
 * run in order, so it is in place by the time Uppy loads.
 *
 * Lives in __fixtures__ (not __tests__) so jest doesn't collect it as a suite.
 */
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
