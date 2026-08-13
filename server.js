"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { encode, decode } = require("./lib/base64");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function serveStatic(urlPath, res) {
  const relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  const fullPath = path.normalize(path.join(PUBLIC_DIR, relative));
  if (!fullPath.startsWith(PUBLIC_DIR) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }
  const ext = path.extname(fullPath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(fullPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);

  if (url === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method === "POST" && (url === "/api/encode" || url === "/api/decode")) {
    try {
      const raw = await readBody(req);
      let payload;
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        sendJson(res, 400, { error: "请求体必须是 JSON" });
        return;
      }
      const text = payload.text;
      if (typeof text !== "string") {
        sendJson(res, 400, { error: "缺少 text 字段" });
        return;
      }
      const result = url === "/api/encode" ? encode(text) : decode(text);
      sendJson(res, 200, { result });
    } catch (err) {
      sendJson(res, 400, { error: err.message || "处理失败" });
    }
    return;
  }

  if (req.method === "GET") {
    serveStatic(url, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method Not Allowed");
});

server.listen(PORT, HOST, () => {
  console.log(`Base64 tool running at http://${HOST}:${PORT}`);
});
