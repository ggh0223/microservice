const mysql = require("mysql");
const con = {
    host: 'localhost',
    user: 'micro',
    password: 'service',
    database: 'monolithic'
}
/*
회원 등록 기능
*/
function register (method, pathname, params, cb) {
    let response = {
        errorcode : 0,
        errormessage : "success"
    }
    if (!params.username || !params.password) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "INSERT INTO members(username, password) values(?, ?)", 
        [params.username, params.password], 
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
회원 인증 기능
*/
function inquiry (method, pathname, params, cb) {
    let response = {
        errorcode : 0,
        errormessage : "success"
    }

    if (!params.username || !params.password) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameter";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "SELECT id FROM members WHERE username=? AND password=?", 
        [params.username, params.password],
        (error, result, fields) => {
            console.log("result :", result)
            console.log("fields :", fields)
            if (error || result.length === 0) {
                response.errorcode = 1;
                response.errormessage = error ? error : "Invalid Password";
            } else {
                response.userid = result[0].id;
            }
            cb(response);
        })
        connection.end();
    }
    
    
    
}
/*
회원 삭제 기능
*/
function unregister (method, pathname, params, cb) {
    let response = {
        errorcode : 0,
        errormessage : "success"
    }
    if (!params.username) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let connection = mysql.createConnection(con);
        connection.connect();
        connection.query(
        "DELETE FROM members WHERE username = ?", 
        [params.username], 
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

exports.onRequest = function (res, method, pathname, params, cb) {
    switch (method) {
        case "GET" : 
            return register(method, pathname, params, (response) => {
                process.nextTick(cb, res, response)
            })
        case "POST" : 
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