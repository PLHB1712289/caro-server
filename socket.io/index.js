const SOCKET_TAG = require("./data");
const socketio = require("socket.io");
const { getIDUserFromToken } = require("../util");
const { userModel, roomModel, messageModel } = require("../database/schema");
const configFile = require("../config");

let io = null;

let listUserOnline = [];
let listRoomOnline = [];

const leaveRoomOnlineByID = async (id) => {
  const newListRoom = [];

  for (let i = 0; i < listRoomOnline.length; i++) {
    listRoomOnline[i].player = listRoomOnline[i].player.filter((player) => {
      if (player !== id) return player;
      return null;
    });

    if (listRoomOnline[i].player.length !== 0)
      newListRoom.push(listRoomOnline[i]);
    else {
      await roomModel.updateOne(
        { idRoom: listRoomOnline[i].id },
        { isOpen: false }
      );
      io.emit(SOCKET_TAG.RESPONSE_REMOVE_ROOM_ONLINE, {
        room: { id: listRoomOnline[i].id },
      });
    }
  }

  listRoomOnline = newListRoom;
};

const joinRoomOnlineByIdSocketAndRoom = (idRoom, idSocket) => {
  for (let i = 0; i < listRoomOnline.length; i++) {
    // update
    if (listRoomOnline[i].id === idRoom) {
      if (
        listRoomOnline[i].player.filter((user) => {
          if (user === idSocket) return user;
          return null;
        }).length === 0
      )
        listRoomOnline[i].player.push(idSocket);
      return;
    }
  }

  listRoomOnline.push({ id: idRoom, player: [idSocket] });
};

// LOG listRoom online
// (() => {
//   setInterval(() => {
//     console.log("[LIST-ROOM-ONLINE]:", listRoomOnline);
//   }, 5000);
// })();

const getIO = () => {
  return io;
};

// Config Socket
const config = (server) => {
  io = socketio(server, {
    cors: true,
    origins: [`${configFile.URL_SERVER}:${process.env.PORT}`],
  });

  io.on("connection", (socket) => {
    // Log
    console.log(`[SOCKET]: new connection ${socket.id}`);

    // ---<1>---
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
      const user = await userModel
        .findOne({ id })
        .select([
          "-_id",
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
    // ---</1>---

    // ---<2>---
    // Receive request update list user when another user sign out
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
    // ---</2>---

    // ---<3>---
    // Receive request join room when user create new room or another user join room
    socket.on(SOCKET_TAG.REQUEST_JOIN_ROOM, async ({ id }) => {
      // Join room
      socket.join(id);
      console.log(`[SOCKET]: JOIN ROOM (ID: ${id})`);

      // room = {id: 1244, player: [user1, user2]}
      joinRoomOnlineByIdSocketAndRoom(id, socket.id);
      // create
      console.log("[SOCKET]: Run after command return");
    });
    // ---<3>---

    // ---<4>---
    // Receive request join room when user leave room.
    socket.on(SOCKET_TAG.REQUEST_LEAVE_ROOM, async ({ id }) => {
      // Leave room
      socket.leave(id);
      console.log(`[SOCKET]: LEAVE ROOM (ID: ${id})`);

      // room = {id: 1244, player: [user1, user2]}
      await leaveRoomOnlineByID(socket.id);
    });
    // ---<4>---

    // ---<5>---
    // Receive request send message
    socket.on(
      SOCKET_TAG.REQUEST_SEND_MESS,
      async ({ idRoom, message, token }) => {
        const idUser = await getIDUserFromToken(token);
        const user = await userModel.findOne({ id: idUser }).select("username");
        const room = await roomModel.findOne({ idRoom });

        if (room.player1 === idUser || room.player2 === idUser) {
          const newMess = await messageModel({
            idUser,
            idRoom,
            message,
          }).save();
          const time = new Date(newMess.created_at);
          const hours =
            time.getHours() > 10 ? `${time.getHours()}` : `0${time.getHours()}`;
          const minutes =
            time.getMinutes() > 10
              ? `${time.getMinutes()}`
              : `0${time.getMinutes()}`;

          socket.to(idRoom).emit(SOCKET_TAG.RESPONSE_SEND_MESS, {
            message: {
              contentMessage: message,
              type: "receiver",
              username: user.username,
              time: `${hours}:${minutes}`,
            },
          });

          io.to(`${socket.id}`).emit(SOCKET_TAG.RESPONSE_SEND_MESS, {
            message: {
              contentMessage: message,
              type: "sender",
              username: user.username,
              time: `${hours}:${minutes}`,
            },
          });
        }
      }
    );
    // ---</5>---

    // ---<6>---
    // Receive request update in4 user when another user become a player
    socket.on(
      SOCKET_TAG.REQUEST_UPDATE_USER_IN_ROOM,
      ({ idRoom, idPlayer, idUser, username }) => {
        socket.to(idRoom).emit(SOCKET_TAG.RESPONSE_UPDATE_USER_IN_ROOM, {
          idRoom,
          idPlayer,
          idUser,
          username,
        });

        io.emit(SOCKET_TAG.RESPONSE_UPDATE_USER_IN_LISTROOM, {
          idRoom,
          idPlayer,
          idUser,
          username,
        });
      }
    );
    // ---</6>---

    // ---<5>---
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

      // leave room
      await leaveRoomOnlineByID(socket.id);
    });
    // ---<5>---
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

  updateAddRoomOnline: (room) => {
    console.log("[SOCKET]: UPDATE ADD ROOM ONLINE");
    io.emit(SOCKET_TAG.RESPONSE_ADD_ROOM_ONLINE, { room });
  },

  updateRemoveRoomOnline: (room) => {
    console.log("[SOCKET]: UPDATE REMOVE ROOM ONLINE");
    io.emit(SOCKET_TAG.RESPONSE_REMOVE_ROOM_ONLINE, { room });
  },
};

module.exports = { getIO, config, service };
