const { getIDUserFromToken } = require("../util");
const { userModel, roomModel, messageModel } = require("../database/schema");
const SOCKET_TAG = require("./data");

const ControllerMessage = class {
  constructor(io) {
    this.io = io;
  }

  async sendMessage({ socket, idRoom, message, token }) {
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

      this.io.to(`${socket.id}`).emit(SOCKET_TAG.RESPONSE_SEND_MESS, {
        message: {
          contentMessage: message,
          type: "sender",
          username: user.username,
          time: `${hours}:${minutes}`,
        },
      });
    }
  }
};

module.exports = ControllerMessage;
