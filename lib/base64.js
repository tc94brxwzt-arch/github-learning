"use strict";

/**
 * Encode UTF-8 text to Base64.
 * @param {string} text
 * @returns {string}
 */
function encode(text) {
  if (typeof text !== "string") {
    throw new TypeError("encode() expects a string");
  }
  return Buffer.from(text, "utf8").toString("base64");
}

/**
 * Decode Base64 to UTF-8 text.
 * @param {string} encoded
 * @returns {string}
 */
function decode(encoded) {
  if (typeof encoded !== "string") {
    throw new TypeError("decode() expects a string");
  }
  const trimmed = encoded.trim();
  if (trimmed.length === 0) {
    return "";
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed) || trimmed.length % 4 !== 0) {
    throw new Error("Invalid Base64 input");
  }
  const decoded = Buffer.from(trimmed, "base64");
  if (decoded.length === 0 && trimmed.replace(/=/g, "").length > 0) {
    throw new Error("Invalid Base64 input");
  }
  return decoded.toString("utf8");
}

module.exports = { encode, decode };
