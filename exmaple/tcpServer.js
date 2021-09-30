const net = require("net");

const server = net.createServer((socket) => {
  socket.end("Hellow World");
});

server.on("error", () => {
  console.log("Error");
});

server.listen(3000, () => {
  console.log("3000 포트에서 서버열림", server.address());
});
