const mysql = require("mysql");
const con = {
    host: 'localhost',
    user: 'micro',
    password: 'service',
    database: 'monolithic'
}
exports.onRequest = function (res, method, pathname, params, cb) {

    //메서드별로 기능 분기
    switch (method) {
        case "POST" : 
            return register(method, pathname, params, (response) => {
                process.nextTick(cb, res, response)
            })
        case "GET" : 
            return inquiry(method, pathname, params, (response) => {
                process.nextTick(cb, res, response)
            })
        case "DELETE" : 
            return unregister(method, pathname, params, (response) => {
                process.nextTick(cb, res, response)
            })
        default :
            return process.nextTick(cb, res, null)

    }
}

/*
상품 등록 기능
*/
function register (method, pathname, params, cb) {
    let response = {
        key : params.key,
        errorcode : 0,
        errormessage : "success"
    }
    if (!params.name || !params.category || !params.price || !params.description) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "INSERT INTO goods(name, category, price, description) values(?, ?, ?, ?)", 
        [params.name, params.category, params.price, params.description], 
        (error, result, fields) => {
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
상품 조회 기능
*/
function inquiry (method, pathname, params, cb) {
    let response = {
        key : params.key,
        errorcode : 0,
        errormessage : "success"
    }
    
    let connection = mysql.createConnection(con);
    connection.connect();
    connection.query(
    "SELECT * FROM goods", 
    (error, result, fields) => {
        if (error || result.length === 0) {
            response.errorcode = 1;
            response.errormessage = error ? error : "no data";
        } else {
            response.result = result;
        }
        cb(response);
    })
    connection.end();
    
}
/*
상품 삭제 기능
*/
function unregister (method, pathname, params, cb) {
    let response = {
        key : params.key,
        errorcode : 0,
        errormessage : "success"
    }
    if (!params.id) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "DELETE FROM goods WHERE id = ?", 
        [params.id], 
        (error, result, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            }
            cb(response);
        })
        connection.end();
    }
}
