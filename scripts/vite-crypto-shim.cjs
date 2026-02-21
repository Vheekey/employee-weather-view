const nodeCrypto = require("node:crypto");

if (
  typeof nodeCrypto.getRandomValues !== "function" &&
  typeof nodeCrypto.webcrypto?.getRandomValues === "function"
) {
  nodeCrypto.getRandomValues = nodeCrypto.webcrypto.getRandomValues.bind(nodeCrypto.webcrypto);
}

if (
  (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") &&
  typeof nodeCrypto.webcrypto?.getRandomValues === "function"
) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
