const net = require("net");

const options = {
  port: 3000,
  host: "127.0.0.1",
};

const client = net.connect(options, () => {
  console.log("Connected");
});

client.on("data", (data) => {
  console.log(data.toString());
});

client.on("end", () => {
  console.log("Disconnected");
});
