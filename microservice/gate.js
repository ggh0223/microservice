const http = require("http");
const url = require("url");
const querystring = require("querystring");
let port = 8000;

const tcpClient = require("./client.js");

let mapClients = {};
let mapUrls = {};
let mapResponse = {};
let mapRR = {};
let index = 0;

const server = http.createServer((req, res) => {

    let method = req.method;
    let uri = url.parse(req.url, true);
    let pathname = uri.pathname;

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
    console.log("listen", server.address());

    let packet =  {
        uri : "/distributes",
        method : "POST",
        key : 0,
        params : {
            port : port,
            name : "gate",
            urls : []
        }
    };

    let isConnectedDistributor = false;

    this.clientDistributor = new tcpClient(
        "127.0.0.1",
        9000,
        //Distributor 접속 완료 이벤트
        (options) => {
            isConnectedDistributor = true;
            this.clientDistributor.write(packet);
        },
        // 데이터 수신 이벤트
        (options, data) => {
            onDistribute(data);
        },
        // 접속 종료 이벤트
        (options) => {
            isConnectedDistributor = false;
        },
        // 에러 이벤트
        (options) => {
            isConnectedDistributor = false;
        }
    );
    setInterval(() => {
        // Distributor 재접속
        if (!isConnectedDistributor) {
            this.clientDistributor.connect();
        }
    }, 3000);

});

function onRequest (res, method, pathname, params) {
    let key = method + pathname;
    let client = mapUrls[key];

    if (client === undefined) { // 처리 가능한 API 만 처리
        res.write(404);
        res.end();
        return
    } else {
        params.key = index; // 고유키발금
        
        let packet = {
            uri : pathname,
            method : method,
            params : params
        };
        
        
        mapResponse[index] = res; // 요청에 대한 응답객체 저장

        index++; // 고유값 증가

        if (mapRR[key] === undefined) { //라운드 로빈 처리
            mapRR[key] = 0;
             
        }
        mapRR[key]++;
        client[mapRR[key] % client.length].write(packet); // 마이크로서비스에 요청  
        
    }
}

/*
Distributor 데이터 수신 처리
*/
function onDistribute (data) {
    for (let n in data.params) {
        let node = data.params[n];
        let key = node.host + ":" + node.port;
        if (mapClients[key] === undefined && node.name !== "gate") {
            let client = new tcpClient(node.host, node.port, onCreateClient, onReadClient, onEndClient, onErrorClient);

            // 마이크로서비스 연결 정보
            mapClients[key] = {
                client : client,
                info : node
            }
            // 마이크로서비스 URL 정보 저장
            for (let m in node.urls) {
                let key = node.urls[m];
                if (mapUrls[key] === undefined) {
                    mapUrls[key] = [];
                }
                mapUrls[key].push(client);
            }
            client.connect();


        }
    }
}

function onCreateClient (options) {
    console.log("onCreateClient");
}

/*
마이크로서비스 응답
*/
function onReadClient (options, packet) { 
    console.log("onReadClient", packet);
    mapResponse[packet.key].writeHead(200, {
        "Content-Type": "application/json"
    });
    mapResponse[packet.key].end(JSON.stringify(packet));
    delete mapResponse[packet.key];
}

/*
마이크로서비스 접속 종료 처리
*/
function onEndClient (options) {
    let key = options.host + ":" + options.port;
    console.log("onEndClient", mapClients[key]);
    for (let n in mapClients[key].info.urls) {
        let node = mapClients[key].info.urls[n];
        delete mapUrls[node];
    }
    delete mapClients[key];
}

function onErrorClient (options) {
    console.log("onErrorClient");
}


