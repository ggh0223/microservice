const http = require("http");
const { URL } = require("url");
const querystring = require("querystring")

const port = 3000;
let server = http
  .createServer((req, res) => {
    let method = req.method;
    let myURL = new URL(req.url, `http://${req.headers.host}`);
    let pathname = myURL.pathname

    console.log(myURL.searchParams.keys)
    if (pathname === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'} );
      return res.end();
    }
    if (method === "POST" || method === "PUT") {
      let body = "";
      req.on('data', (data) => {
        body+=data;
      });
      req.on('end', () => {
        let params;
        if (req.headers['content-type'] === "application/json") {
          params = JSON.parse(body)
        } else {
          params = body
        }
        onRequest(res, method, pathname, params);
      })

    } else {
      onRequest(res, method, pathname, myURL.searchParams);
    }

    res.end("Hello World");
  })
  .listen(port, () => {
    console.log(`Connected server on ${port}`);
  });

  function onRequest (res, method, pathname, params) {
    res.end("response")
  }
