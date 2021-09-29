// 이벤트를 이용한 예외처리

const func = (callback) => {
  process.nextTick(callback, "callback");
};

try {
  func((param) => {
    parameter.a = "callback";
  });
} catch (error) {
  console.log("error :" + error);
}

process.on("uncaughtException", (error) => {
  console.log("uncaughtException");
});

// Terminal

// kyu@PC-kyu:~/projects/microservice/exmaple$ node uncaughtException.js
// uncaughtException
