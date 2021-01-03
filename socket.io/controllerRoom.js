const SOCKET_TAG = require("./data");
const { roomModel, gameModel } = require("../database/schema");
const ControllerGame = require("./controllerGame");
const controllerUser = require("./controllerUser");
const controllerSocket = require("./controllerSocket");

const STATUS_ROOM = {
  WAITING: "waiting",
  READY: "ready",
  PLAYING: "playing",
};

const ControllerRoom = class {
  constructor() {
    this.listRoomOnline = [];
    this.io = null;

    // LOG listRoom online
    // (() => {
    //   setInterval(() => {
    //     console.log("[LIST-ROOM-ONLINE]:", this.listRoomOnline);
    //   }, 5000);
    // })();
  }

  setIO(io) {
    this.io = io;
  }

  async leaveRoom(socketID) {
    const newListRoom = [];

    for (let i = 0; i < this.listRoomOnline.length; i++) {
      const { socketIDPlayer1, socketIDPlayer2 } = this.listRoomOnline[i];

      if (socketIDPlayer1 === socketID) {
        this.listRoomOnline[i].socketIDPlayer1 = null;
      } else if (socketIDPlayer2 === socketID) {
        this.listRoomOnline[i].socketIDPlayer2 = null;
      }

      if (
        this.listRoomOnline[i].socketIDPlayer1 ||
        this.listRoomOnline[i].socketIDPlayer2
      ) {
        newListRoom.push({
          ...this.listRoomOnline[i],
          status: STATUS_ROOM.WAITING,
        });

        this.io
          .to(
            this.listRoomOnline[i].socketIDPlayer1 ||
              this.listRoomOnline[i].socketIDPlayer2
          )
          .emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM_FOR_PLAYER, {
            room: { status: STATUS_ROOM.WAITING },
          });
      } else {
        await roomModel.updateOne(
          { idRoom: this.listRoomOnline[i].id },
          { isOpen: false }
        );
        this.io.emit(SOCKET_TAG.RESPONSE_REMOVE_ROOM_ONLINE, {
          room: { id: this.listRoomOnline[i].id },
        });
      }
    }

    this.listRoomOnline = newListRoom;
  }

  joinRoom(roomID, socketID) {
    // update user in room if exist
    for (let i = 0; i < this.listRoomOnline.length; i++) {
      const { id, socketIDPlayer1, socketIDPlayer2 } = this.listRoomOnline[i];

      // update
      if (id === roomID) {
        // response status game
        if (this.listRoomOnline[i].controllerGame) {
          this.listRoomOnline[i].controllerGame.reConnect(socketID);
        }

        if (socketIDPlayer1 !== socketID && socketIDPlayer2 === null) {
          // update player2
          this.listRoomOnline[i].socketIDPlayer2 = socketID;

          // update status room
          this.listRoomOnline[i].status = STATUS_ROOM.READY;

          // send request update for client
          this.io.emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM, {
            room: { id: roomID, status: STATUS_ROOM.READY },
          });

          this.io
            .to(this.listRoomOnline[i].socketIDPlayer1)
            .to(this.listRoomOnline[i].socketIDPlayer2)
            .emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM_FOR_PLAYER, {
              room: { status: STATUS_ROOM.READY },
            });
        }

        return;
      }
    }

    this.listRoomOnline.push({
      id: roomID,
      socketIDPlayer1: socketID,
      socketIDPlayer2: null,
      status: STATUS_ROOM.WAITING,
      controllerGame: null,
    });

    this.io.emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM, {
      room: { id: roomID, status: STATUS_ROOM.WAITING },
    });
  }

  async newGame(roomID) {
    let gameID = null;
    for (let i = 0; i < this.listRoomOnline.length; i++) {
      const { id, socketIDPlayer1, socketIDPlayer2 } = this.listRoomOnline[i];

      if (id === roomID) {
        const player1 = controllerUser.getUserID(socketIDPlayer1);
        const player2 = controllerUser.getUserID(socketIDPlayer2);

        if (!this.listRoomOnline[i].controllerGame) {
          this.listRoomOnline[i].controllerGame = new ControllerGame(
            this.io,
            roomID,
            player1,
            player2
          );
        }

        gameID = await this.listRoomOnline[i].controllerGame.startGame();
        break;
      }
    }
    return gameID;
  }
};

const controllerRoom = new ControllerRoom();

module.exports = controllerRoom;
