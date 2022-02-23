/* eslint-disable require-jsdoc */

function digestMessage(message, algo = 'SHA-256') {
  return new Promise((resolve, reject) => {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    // hash the message
    window.crypto.subtle
      .digest(algo, msgUint8)
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''); // convert bytes to hex string
        resolve(hashHex);
      })
      .catch((err) => reject(err));
  });
}

export default digestMessage;
