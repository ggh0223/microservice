const http = require("http");
const port = 3000;
const server = http.createServer((req, res) => {
  res.end("Hello World");
});

server.listen(port, () => {
  console.log(port + "에서 서버 열림");
});
