'use strict'

const net = require("net");
const tcpClient = require('./client.js');

class tcpServer {
    constructor (name, port, urls) {
        this.context = {
            port: port,
            name: name,
            urls: urls
        }
        this.merge = {};
        this.server = net.createServer((socket) => {
            this.onCreate(socket);

            socket.on("error", (exception) => {
                this.onClose(socket);
            })

            socket.on("close", () => {
                this.onClose(socket);
            })

            socket.on("data", (data) => {
                let key = socket.remoteAddress + ":" + socket.remotePort;
                let sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();
                console.log(key)
                console.log(sz)
                let arr = sz.split("¶");

                for (let n in arr) {
                    if (sz.charAt(sz.length-1) !== "¶" && n === arr.length-1) {
                        this.merge[key] = arr[n];
                        break;
                    } else if (arr[n] === "") {
                        break;
                    } else {
                        this.onRead(socket, JSON.parse(arr[n]));
                    }
                }
            })
        })

        this.server.on("error", (err) => {
            console.log(err);
        })

        this.server.listen(port, () => {
            console.log('listen', this.server.address());
        })

    }

    onCreate (socket) {
        console.log("onCreate", socket.remoteAddress, socket.remotePort)
    }

    onClose (socket) {
        console.log("onClose", socket.remoteAddress, socket.remotePort)
    }

    connectDistributor (host, port, onNoti) { // Distribute 접속함수
        let packet = {  // Distributor 에 전달할 패킷 정의
            uri: "/distributes",
            method: "POST",
            key: 0,
            params: this.context
        };

        let isConnectedDistributor = false; // 접속상태

        // Client 클래스 인스턴스 생성
        this.clientDistributor = new tcpClient(host, port, 
        (options) => { // 접속이벤트
            isConnectedDistributor = true;
            this.clientDistributor.write(packet);
        },
        (options, data) => { // 데이터 수신
            onNoti(data)
        },
        (options) => { // 접속 종료 이벤트
            isConnectedDistributor = false;
        },
        (options) => { // 에러 이벤트
            isConnectedDistributor = false;
        })

        setInterval(() => {
            if (!isConnectedDistributor) {
                this.clientDistributor.connect();
            }
        }, 3000);
    }

}

module.exports = tcpServer;