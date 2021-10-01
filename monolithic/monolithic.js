const http = require("http");

const { URL } = require("url");

const port = 3000;
let server = http
  .createServer((req, res) => {
    let method = req.method;
    let myURL = new URL(req.url, "http://localhost:3000");
    console.log(method, myURL);
    res.end("Hello World");
  })
  .listen(port, () => {
    console.log(`Connected server on ${port}`);
  });
