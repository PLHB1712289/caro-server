const SOCKET_TAG = require("./data");
const socketio = require("socket.io");
const { getIDUserFromToken } = require("../util");
const { gameModel } = require("../database/schema");
const configFile = require("../config");

const controllerRoom = require("./controllerRoom");
const controllerUser = require("./controllerUser");
const ControllerGame = require("./controllerGame");
const ControllerMessage = require("./controllerMessage");

const controllerSocket = require("./controllerSocket");

let io = null;

const timeCounter = async (
  idRoom,
  idGame,
  idPlayer1,
  idPlayer2,
  player,
  timmerPlayer1,
  timmerPlayer2
) => {
  while (timmerPlayer1 >= 0 && timmerPlayer2 >= 0) {
    io.to(idRoom).emit(SOCKET_TAG.RESPONSE_TIMMER, {
      time: { timePlayer1: timmerPlayer1, timePlayer2: timmerPlayer2 },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (player === idPlayer1) {
      timmerPlayer1--;
    } else {
      timmerPlayer2--;
    }
  }

  const playerTimeUp = timmerPlayer1 < 0 ? "player1" : "player2";

  io.to(idRoom).emit(SOCKET_TAG.RESPONSE_TIME_UP, {
    player: playerTimeUp,
  });
};

const getIO = () => {
  return io;
};

// Config Socket
const config = (server) => {
  io = socketio(server, {
    cors: true,
    origins: [`${configFile.URL_SERVER}:${process.env.PORT}`],
  });

  controllerUser.setIO(io);
  controllerRoom.setIO(io);
  const controllerMessage = new ControllerMessage(io);

  io.on("connection", (socket) => {
    controllerSocket.push(socket);
    // Log
    console.log(`[SOCKET]: new connection ${socket.id}`);

    // ---<1>---
    // Receive request update user online when user connect (user logged in before ~ user already have a token)
    socket.on(SOCKET_TAG.REQUEST_USER_ONLINE, async ({ token }) => {
      // Parse user' id from token
      const userID = getIDUserFromToken(token);
      await controllerUser.userOnline(userID, socket.id);
    });
    // ---</1>---

    // ---<2>---
    // Receive request update list user when another user sign out
    socket.on(SOCKET_TAG.REQUEST_USER_OFFLINE, async ({ token }) => {
      // Parse user's id from token
      const userID = getIDUserFromToken(token);
      await controllerUser.userOffline(userID, socket.id);
    });
    // ---</2>---

    // ---<3>---
    // Receive request join room when user create new room or another user join room
    socket.on(SOCKET_TAG.REQUEST_JOIN_ROOM, async ({ id }) => {
      // Join room
      socket.join(id);
      console.log(`[SOCKET]: JOIN ROOM (ID: ${id})`);
      controllerRoom.joinRoom(id, socket.id);
    });
    // ---<3>---

    // ---<4>---
    // Receive request join room when user leave room.
    socket.on(SOCKET_TAG.REQUEST_LEAVE_ROOM, async ({ id }) => {
      // Leave room
      socket.leave(id);
      await controllerRoom.leaveRoom(socket.id);
    });
    // ---<4>---

    // ---<5>---
    // Receive request send message
    socket.on(
      SOCKET_TAG.REQUEST_SEND_MESS,
      async ({ idRoom, message, token }) => {
        await controllerMessage.sendMessage({ socket, idRoom, message, token });
      }
    );
    // ---</5>---

    // ---<6>---
    // Receive request update in4 user when another user become a player
    socket.on(
      SOCKET_TAG.REQUEST_UPDATE_USER_IN_ROOM,
      ({ idRoom, player1, player2 }) => {
        socket.to(idRoom).emit(SOCKET_TAG.RESPONSE_UPDATE_USER_IN_ROOM, {
          idRoom,
          player1,
          player2,
        });

        io.emit(SOCKET_TAG.RESPONSE_UPDATE_USER_IN_LISTROOM, {
          idRoom,
          player1,
          player2,
        });
      }
    );
    // ---</6>---

    // ---<7>---
    // Receive request update in4 user when another user become a player
    socket.on(SOCKET_TAG.REQUEST_NEW_GAME, async ({ idRoom }) => {
      controllerRoom.newGame(idRoom);
    });
    // ---</7>---

    // ---<8>---
    // Handle event when user disconnect, update list user online
    socket.on("disconnect", async () => {
      // Log
      console.log(`[SOCKET]: disconnect ${socket.id}`);

      // disconnect
      await controllerUser.userDisconnect(socket.id);
      // leave room
      await controllerRoom.leaveRoom(socket.id);
      // remove socket
      controllerSocket.remove(socket.id);
    });
    // ---<8>---
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
