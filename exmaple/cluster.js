 const cluster = require("cluster");

 const http = require("http");

 const numCPUs = require("os").cpus().length; // cpu의 코어수

 if (cluster.isMaster) { // 부모프로세스와 자식프로세스를 구분
     console.log(`Master ${process.pid} is running`)

     for (let i = 0; i < numCPUs; i++) {
         cluster.fork(); // 코어 수 만큼 자식 프로세스 실행
     }

     cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died` );
     });
 } else {
     http.createServer((res, req) => {
         res.writeHead(200);
         res.end('hello world\n');
     }).listen(8000);

     console.log(`worker ${process.pid} started`);
 }