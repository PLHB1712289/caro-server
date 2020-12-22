const SOCKET_TAG = require("./data");
const socketio = require("socket.io");
const { getIDUserFromToken } = require("../util");
const { userModel } = require("../database/schema");

let numOfOnlineUsers = 0;

let listUserOnline = [];

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
    console.log(`[SOCKET]: new connection ${socket.id}`);

    socket.on(SOCKET_TAG.REQUEST_USER_ONLINE, async ({ token }) => {
      const idUser = getIDUserFromToken(token);

      listUserOnline.push({
        idSocket: socket.id,
        idUser,
      });

      const user = await userModel.findOne({ id: idUser });

      user.isOnline = true;
      await user.save();

      const { id, username, totalGame, totalGameWin, totalGameLose } = user;

      io.emit(SOCKET_TAG.RESPONSE_USER_ONLINE, {
        user: {
          id,
          username,
          totalGame,
          totalGameWin,
          totalGameLose,
        },
      });

      console.log("[LIST USER ONLINE]:", listUserOnline);
    });

    socket.on(SOCKET_TAG.REQUEST_USER_OFFLINE, async ({ token }) => {
      const idUser = getIDUserFromToken(token);

      listUserOnline = listUserOnline.filter((item) => {
        if (item.idSocket !== socket.id) return item;
      });

      const user = await userModel.findOne({ id: idUser });
      user.isOnline = false;
      await user.save();
      io.emit(SOCKET_TAG.RESPONSE_USER_OFFLINE, { user: { id: idUser } });
    });

    socket.on("disconnect", async () => {
      console.log(`[SOCKET]: disconnect ${socket.id}`);

      let idUser = null;
      listUserOnline = listUserOnline.filter((item) => {
        if (item.idSocket !== socket.id) return item;
        else idUser = item.idUser;
      });

      if (idUser) {
        const user = await userModel.findOne({ id: idUser });
        user.isOnline = false;
        await user.save();

        io.emit(SOCKET_TAG.RESPONSE_USER_OFFLINE, { user: { id: idUser } });
      }
    });
  });

  console.log("Config socket.io success");
};

const service = {
  updateUserOnline: (user) => {
    console.log("[SOCKET]: UPDATE USER ONLINE");

    const { id, totalGame, totalGameWin, totalGameLose, username } = user;

    io.emit(SOCKET_TAG.RESPONSE_USER_ONLINE, {
      user: { id, totalGame, totalGameWin, totalGameLose, username },
    });
  },

  removeUserOffline: (user) => {
    console.log("[SOCKET]: UPDATE USER ONLINE");
    io.emit(SOCKET_TAG.RESPONSE_USER_ONLINE, { user });
  },

  updateRoomOnline: (room) => {
    console.log("[SOCKET]: UPDATE USER ONLINE");
    io.emit(SOCKET_TAG.RESPONSE_ROOM_ONLINE, { room });
  },
};

module.exports = { getIO, config, service, listUserOnline };
