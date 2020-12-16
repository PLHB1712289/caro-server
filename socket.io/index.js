const SOCKET_TAG = require("./dataConst");

let numOfOnlineUsers = 0;

const socketio = require("socket.io");
let io = null;

const getIO = () => {
  return io;
};

const config = (server) => {
  io = socketio(server, {
    cors: true,
    origins: ["http://127.0.0.1:3000"],
  });
  io.on("connection", (socket) => {
    // update
    numOfOnlineUsers++;

    // send event
    io.emit(SOCKET_TAG.RESPONSE_UPDATE_USER_ONLINE, {
      numberUser: numOfOnlineUsers,
    });

    // send message
    socket.on(SOCKET_TAG.REQUEST_JOIN_GAME, ({ idGame }) => {
      socket.join(idGame);
    });

    // send message
    socket.on(SOCKET_TAG.REQUEST_SEND_MESSAGE, ({ idGame, message }) => {
      socket.to(idGame).emit(SOCKET_TAG.RESPONSE_SEND_MESSAGE, {
        message,
      });
    });

    // event disconnect
    socket.on("disconnect", () => {
      numOfOnlineUsers--;
      io.emit(SOCKET_TAG.RESPONSE_UPDATE_USER_ONLINE, {
        numberUser: numOfOnlineUsers,
      });
    });
  });
  console.log("Config socket.io success");
};

module.exports = { getIO, config };
