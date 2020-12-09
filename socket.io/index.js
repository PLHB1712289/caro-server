const SOCKET_TAG = require("./dataConst");

let numOfOnlineUsers = 0;

const config = (io) => {
  io.on("connection", (socket) => {
    // update
    numOfOnlineUsers++;

    // send event
    io.emit(SOCKET_TAG.RESPONSE_UPDATE_USER_ONLINE, {
      numberUser: numOfOnlineUsers,
    });

    // event disconnect
    socket.on("disconnect", () => {
      numOfOnlineUsers--;
      io.emit(SOCKET_TAG.RESPONSE_UPDATE_USER_ONLINE, {
        numberUser: numOfOnlineUsers,
      });
    });
  });
};

console.log("Config socket.io success");

module.exports = { config };
