const http = require("http");
const url = require("url");
const querystring = require("querystring");

//모듈로드
const members = require("./monolithic_members.js");
const goods = require("./monolithic_goods.js");
const purchases = require("./monolithic_purchases.js");

const port = 3000;

//HTTP 서버, 요청처리
let server = http
  .createServer((req, res) => {
    let method = req.method;
    let uri = url.parse(req.url, true)
    let pathname = uri.pathname

    // if (pathname === '/favicon.ico') {
    //   res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    //   return res.end();
    // }
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
          params = querystring.parse(body)
        }
        onRequest(res, method, pathname, params);
      })

    } else {
      onRequest(res, method, pathname, uri.query);
    }

  })
  .listen(port, () => {
    console.log(`Connected server on ${port}`);
});

/*
요청에 대해 모듈별로 분기
res : reponse 객체
method : 메서드 (ex. GET, POST, PUT, DELETE)
pathname : URI
params : 입력 쿼리 파라미터
*/
function onRequest (res, method, pathname, params) {
  switch (pathname) {
    case "/members" : members.onRequest(res, method, pathname, params, response)
      break;
    case "/goods" : goods.onRequest(res, method, pathname, params, response)
      break;
    case "/purchases" : purchases.onRequest(res, method, pathname, params, response)
      break;
    default : 
      res.writeHead(404);
      return res.end()
  }

  res.end("response")
}

/*
HTTP 헤더에 JSON 형식으로 전달
res : response 객체
packet : 결과 파라미터
*/
function response (res, packet) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(packet))
}

