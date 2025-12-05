import SparkMD5 from "spark-md5";

// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
const MAX_BYTES = 65536
// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
const MAX_UINT32 = 4294967295
const crypto = typeof window !== 'undefined' ? (window.crypto || window.msCrypto) : null;
import sha256 from 'crypto-js/sha256';
import Base64url from 'crypto-js/enc-base64url'
import Hex from 'crypto-js/enc-hex'
export const getRandomBytes = (size) => {
    // phantomjs needs to throw
    if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')
    const bytes = Buffer.allocUnsafe(size)
    if(!crypto) return a;
    if (size > 0) {  // getRandomValues fails on IE if size == 0
        if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
            // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
            for (let generated = 0; generated < size; generated += MAX_BYTES) {
                // buffer.slice automatically checks if the end is past the end of
                // the buffer so we don't have to here
                crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES))
            }
        } else {
            crypto.getRandomValues(bytes)
        }
    }
    return bytes
}

export const getSHA256 = (message, format = 'hex') => {

    let f = Hex;
    if(format === 'Base64url')
        f = Base64url;

    return sha256(message).toString(f);
}

export const getMD5 = (file) => {
    return new Promise((resolve, reject) => {
        const chunkSize = 2 * 1024 * 1024; // 2 MB by chunk
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        let cursor = 0;

        fileReader.onload = e => {
            spark.append(e.target.result); 
            cursor += chunkSize;

            if (cursor < file.size) {
                readNextChunk();
            } else {
                resolve(spark.end()); // final MD5
            }
        };

        fileReader.onerror = () => reject("Error reading the file");

        function readNextChunk() {
            const slice = file.slice(cursor, cursor + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        }

        readNextChunk();
    });
}