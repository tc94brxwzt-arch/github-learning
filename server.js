"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const ROOT = __dirname;
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;

const githubCssPath = require.resolve("github-markdown-css/github-markdown.css");
const GITHUB_CSS = fs.readFileSync(githubCssPath, "utf8");

marked.setOptions({ gfm: true, breaks: false });

function listMarkdownFiles() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

function htmlPage(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
${GITHUB_CSS}
body { box-sizing: border-box; margin: 0; padding: 2rem; background: #f6f8fa; }
.markdown-body { max-width: 900px; margin: 0 auto; background: #fff; padding: 2.5rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.nav { max-width: 900px; margin: 0 auto 1rem; font-size: 14px; }
.nav a { margin-right: 1rem; }
</style>
</head>
<body>
<div class="nav"><a href="/">\u2190 \u6240\u6709\u6587\u6863</a></div>
<article class="markdown-body">
${bodyHtml}
</article>
</body>
</html>`;
}

function renderIndex() {
  const files = listMarkdownFiles();
  const items = files
    .map((name) => `<li><a href="/${encodeURIComponent(name)}">${name}</a></li>`)
    .join("\n");
  const body = `<h1>GitHub Learning \u2014 \u6587\u6863\u9884\u89c8</h1>
<p>\u9009\u62e9\u4e00\u4e2a Markdown \u6587\u4ef6\u67e5\u770b\u6e32\u67d3\u540e\u7684\u6548\u679c\uff1a</p>
<ul>
${items || "<li>\u6ca1\u6709\u627e\u5230 Markdown \u6587\u4ef6\u3002</li>"}
</ul>`;
  return htmlPage("GitHub Learning \u9884\u89c8", body);
}

function renderMarkdown(fileName) {
  const safeName = path.basename(fileName);
  const fullPath = path.join(ROOT, safeName);
  if (
    !safeName.toLowerCase().endsWith(".md") ||
    !fs.existsSync(fullPath) ||
    !fs.statSync(fullPath).isFile()
  ) {
    return null;
  }
  const source = fs.readFileSync(fullPath, "utf8");
  return htmlPage(safeName, marked.parse(source));
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  if (url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", files: listMarkdownFiles() }));
    return;
  }

  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderIndex());
    return;
  }

  const page = renderMarkdown(url.replace(/^\//, ""));
  if (page === null) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(htmlPage("404", "<h1>404</h1><p>\u627e\u4e0d\u5230\u8be5\u6587\u6863\u3002</p>"));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page);
});

server.listen(PORT, HOST, () => {
  console.log(`Markdown preview server running at http://${HOST}:${PORT}`);
  console.log(`Serving ${listMarkdownFiles().length} markdown file(s) from ${ROOT}`);
});
