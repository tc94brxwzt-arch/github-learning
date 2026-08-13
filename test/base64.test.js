"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { encode, decode } = require("../lib/base64");

describe("base64 encode/decode", () => {
  it("encodes ASCII text", () => {
    assert.equal(encode("hello"), "aGVsbG8=");
  });

  it("encodes Chinese text", () => {
    assert.equal(encode("你好"), "5L2g5aW9");
  });

  it("round-trips mixed text", () => {
    const original = "GitHub 学习：Base64 小工具 123!@#";
    assert.equal(decode(encode(original)), original);
  });

  it("decodes a known value", () => {
    assert.equal(decode("aGVsbG8="), "hello");
  });

  it("treats empty input as empty output", () => {
    assert.equal(encode(""), "");
    assert.equal(decode(""), "");
    assert.equal(decode("   "), "");
  });

  it("rejects invalid Base64", () => {
    assert.throws(() => decode("not base64!!!"), /Invalid Base64/);
    assert.throws(() => decode("abc"), /Invalid Base64/);
  });

  it("rejects non-string input", () => {
    assert.throws(() => encode(null), TypeError);
    assert.throws(() => decode(123), TypeError);
  });
});
