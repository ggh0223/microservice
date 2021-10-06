'use strict'
const net = require("net");

class tcpClient {
    /* 생성자 */
    constructor (host, port, onCreate, onRead, onEnd, onError) {
        this.option = {
            host: host,
            port: port
        }
        this.onCreate = onCreate
        this.onRead = onRead
        this.onEnd = onEnd
        this.onError = onError
    }

    /* 접속함수 */
    connect () {
        this.client = net.connect(this.option, () => {
            if (this.onCreate) {
                this.onCreate(this.option)
            }
        })

        /* 데이터 수신 */
        this.client.on('data', (data) => {
            let sz = this.merge ? this.merge + data.toString() : data.toString()
            let arr = sz.split("¶")
            console.log(sz)

            for (let n in arr) {
                if (sz.charAt(sz.length-1) !== "¶" && n === arr.length-1) {
                    this.merge = arr[n]
                    break;
                } else if (arr[n] === "") {
                    break;
                } else {
                    this.onRead(this.option, JSON.parse(arr[n]))
                }
            }
        })

        /* 접속 종료 */
        this.client.on('close', () => {
            if (this.onEnd) {
                this.onEnd(this.option)
            }
        })

        /* 에러 처리 */
        this.client.on('error', (err) => {
            if (this.onError) {
                this.onError(this.option, err)
            }
        })
    }

    /* 데이터발송 */
    write (packet) {
        this.client.write(JSON.stringify(packet) + '¶')
    }
}

module.exports = tcpClient;