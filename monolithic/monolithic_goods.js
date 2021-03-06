const mysql = require("mysql");
const con = {
    host: 'localhost',
    user: 'micro',
    password: 'service',
    database: 'monolithic',
    multipleStatements : true
};

const redis = require("redis").createClient(); //redis 모듈 로드
redis.on('error', function (err) { //redis 에러처리
    console.log("Redis Error" + err);
})

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
        "INSERT INTO goods(name, category, price, description) values(?, ?, ?, ?); select LAST_INSERT_ID() as id;", 
        [params.name, params.category, params.price, params.description], 
        (error, result, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            } else {
                const id = result[1][0].id;
                redis.set(id, JSON.stringify(params)); // redis 등록
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

    //redis 테스트 코드
    /* if (redis.get("2")) { 
        redis.get("2", (err, data) => {
            if (err) {
                response.errorcode = 1;
                response.errormessage = error ? error : "no data";
            } else {
                response.result = data; -> JSON형태의 문자열이므로 Parsing해줘야한다.
                
            }
            cb(response);
        });
        
    } else { 

    }*/
    
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
            } else {
                redis.del(params.id) //redis 삭제
            }
            cb(response);
        })
        connection.end();
    }
}
