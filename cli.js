"use strict";

const { encode, decode } = require("./lib/base64");

function usage() {
  console.log(`用法:
  node cli.js encode <文本>
  node cli.js decode <Base64>
  echo 文本 | node cli.js encode
  echo Base64 | node cli.js decode`);
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data.replace(/\n$/, "")));
  });
}

async function main() {
  const action = process.argv[2];
  if (action !== "encode" && action !== "decode") {
    usage();
    process.exitCode = 1;
    return;
  }

  const fromArgs = process.argv.slice(3).join(" ");
  const text = fromArgs || (process.stdin.isTTY ? "" : await readStdin());

  try {
    const result = action === "encode" ? encode(text) : decode(text);
    process.stdout.write(result + "\n");
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

main();
