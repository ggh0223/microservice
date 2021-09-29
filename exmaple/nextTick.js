function func(callback) {
  process.nextTick(callback, "callback");
}

try {
  func((param) => {
    parameter.a = "callback"; // 의도적으로 예외 발생
  });
} catch (error) {
  console.log("error : " + error);
}

// Terminal

// kyu@PC-kyu:~/projects/microservice/exmaple$ node nextTick.js
// /home/kyu/projects/microservice/exmaple/nextTick.js:7
//     parameter.a = "callback";
//     ^

// ReferenceError: parameter is not defined
//     at /home/kyu/projects/microservice/exmaple/nextTick.js:7:5
//     at processTicksAndRejections (internal/process/task_queues.js:79:21)

// process.nextTick 함수는 비동기 처리를 위해 Node.js 내부의 스레드 풀로 다른 스레드 위에서 콜백 함수를 동작한다.
// try~catch문은 같은 스레드 위에서만 동작하기때문에 서로 다른 스레드 간의 예외처리가 불가능하다.
// 이처럼 process.nextTick 함수를 이용하면 Node.js가 CPU를 효율적으로 사용하는 대신 try~catch 문만으로는 예외 처리가 불가능하다.
