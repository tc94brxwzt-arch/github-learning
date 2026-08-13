# Base64 小工具

把文本编码成 Base64，或把 Base64 还原成原文。支持中文等 UTF-8 字符。

## 网页版

```bash
npm start
```

然后打开 http://localhost:3000 ，在页面里输入内容并选择「编码」或「解码」。

## 命令行

```bash
node cli.js encode "你好"
# 5L2g5aW9

node cli.js decode "5L2g5aW9"
# 你好
```

也可以用管道：

```bash
echo -n "hello" | node cli.js encode
```

## 接口

- `POST /api/encode` 请求体：`{"text":"你好"}`
- `POST /api/decode` 请求体：`{"text":"5L2g5aW9"}`
- `GET /health`

## 测试

```bash
npm test
```
