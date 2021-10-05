const mysql = require("mysql");
const con = {
    host: 'localhost',
    user: 'micro',
    password: 'service',
    database: 'monolithic'
}

exports.onRequest = function (res, method, pathname, params, cb) {

    switch (method) {
        case "POST" : 
            return register(method, pathname, params, (response) => {
                process.nextTick(cb, res, response)
            })
        case "GET" : 
            return inquiry(method, pathname, params, (response) => {
                process.nextTick(cb, res, response)
            })
        default :
            return process.nextTick(cb, res, null)

    }
}

/*
구매 기능
*/
function register (method, pathname, params, cb) {
    let response = {
        errorcode : 0,
        errormessage : "success"
    }
    if (!params.userid || !params.goodsid) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "INSERT INTO purchases(userid, goodsid) values(?, ?)", 
        [params.userid, params.goodsid], 
        (error, result, fields) => {
            console.log("result :", result)
            console.log("fields :", fields)
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            }
            cb(response);
        })
        connection.end();
    }
}
/*
구매 내역 조회 기능
*/
function inquiry (method, pathname, params, cb) {
    let response = {
        errorcode : 0,
        errormessage : "success"
    }

    if (!params.userid) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameter";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "SELECT id, goodsid, date FROM purchases WHERE userid=?", 
        [params.userid],
        (error, result, fields) => {
            console.log("result :", result)
            console.log("fields :", fields)
            if (error || result.length === 0) {
                response.errorcode = 1;
                response.errormessage = error ? error : "Invalid Password";
            } else {
                response.result = result;
            }
            cb(response);
        })
        connection.end();
    }

}