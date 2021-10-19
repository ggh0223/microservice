'use strict'

const cluster = require("cluster");
const fs = require("fs");

class logs extends require('./server.js') {
    constructor () {
        super("logs",
            process.argv[2] ? Number(process.argv[2]) : 9040,
            ["POST/logs"]
        )
        
        // 스트림 생성
        // 책에서는 단순하게 모든 로그를 한 파일에 저장하지만
        // 실제로는 각 시스템에 맞게 로그를 모아 저장하는 것이 더 효율적이다.
        this.writestream = fs.createWriteStream('./log.txt', { flags : "a"});
    
        this.connectToDistributor("127.0.0.1", 9000, (data) => {
            console.log("Distributor Notification", data)
        })
    }

    onRead(socket, data) {
        const sz = new Date().toLocaleString() + '/t' 
        + socket.remoteAddress + '/t' 
        + socket.remotePort + '/t'
        + JSON.stringify(data) + '/n';

        console.log(sz)
        this.writestream.write(sz) // 로그 파일 저장
    }

}

if (cluster.isMaster) {
    cluster.fork();

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
        cluster.fork();
    });
} else {
    new logs();
}