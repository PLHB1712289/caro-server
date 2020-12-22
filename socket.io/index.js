const SOCKET_TAG = require("./data");
const socketio = require("socket.io");
const { getIDUserFromToken } = require("../util");
const { userModel } = require("../database/schema");
const configFile = require("../config");

let listUserOnline = [];

let io = null;

const getIO = () => {
  return io;
};

const config = (server) => {
  io = socketio(server, {
    cors: true,
    origins: [`${configFile.URL_SERVER}:${process.env.PORT}`],
  });

  io.on("connection", (socket) => {
    // Log
    console.log(`[SOCKET]: new connection ${socket.id}`);

    // 1
    // Receive request update user online when user connect (user logged in before ~ user already have a token)
    socket.on(SOCKET_TAG.REQUEST_USER_ONLINE, async ({ token }) => {
      // Parse user' id from token
      const id = getIDUserFromToken(token);

      // Push user into listUserOnline
      listUserOnline.push({
        idSocket: socket.id,
        idUser: id,
      });

      // Find user on database
      const user = await (await userModel.findOne({ id })).isSelected([
        "id",
        "username",
        "totalGame",
        "totalGameWin",
        "totalGameLose",
      ]);

      // Update status isOnline
      await userModel.updateOne({ id }, { isOnline: true });

      // Response for client
      io.emit(SOCKET_TAG.RESPONSE_USER_ONLINE, { user });
    });

    // 2
    // Recieve request update list user when another user sign out
    socket.on(SOCKET_TAG.REQUEST_USER_OFFLINE, async ({ token }) => {
      // Parse user's id from token
      const idUser = getIDUserFromToken(token);

      // Remove user in listUserOnline
      listUserOnline = listUserOnline.filter((item) => {
        if (item.idSocket !== socket.id) return item;
      });

      // Update status isOnline
      await userModel.updateOne({ id: idUser }, { isOnline: false });

      // Response for another client
      io.emit(SOCKET_TAG.RESPONSE_USER_OFFLINE, { user: { id: idUser } });
    });

    // 3
    // Handle event when user disconnect, update list user online
    socket.on("disconnect", async () => {
      // Log
      console.log(`[SOCKET]: disconnect ${socket.id}`);

      // Get user from listUserOnline
      let idUser = null;
      listUserOnline = listUserOnline.filter((item) => {
        if (item.idSocket !== socket.id) return item;
        else idUser = item.idUser;
      });

      // Update status isOnline
      if (idUser) {
        await userModel.updateOne({ id: idUser }, { isOnline: false });

        // Response for client
        io.emit(SOCKET_TAG.RESPONSE_USER_OFFLINE, { user: { id: idUser } });
      }
    });
  });

  console.log("Config socket.io success");
};

// Some service is provided for another layer
const service = {
  // updateUserOnline is used when another user sign in
  updateUserOnline: (user) => {
    const { id, totalGame, totalGameWin, totalGameLose, username } = user;

    io.emit(SOCKET_TAG.RESPONSE_USER_ONLINE, {
      user: { id, totalGame, totalGameWin, totalGameLose, username },
    });
  },

  updateRoomOnline: (room) => {
    console.log("[SOCKET]: UPDATE USER ONLINE");
    io.emit(SOCKET_TAG.RESPONSE_ROOM_ONLINE, { room });
  },
};

module.exports = { getIO, config, service };
