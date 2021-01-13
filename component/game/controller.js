const service = require("./service");
const { getIO } = require("../../socket.io");
const { getIDUserFromToken } = require("../../util");

const controller = {
  // Tao game moi
  POST_createNewGame: async (req, res) => {
    // Ten game
    const { name } = req.body;
    // Lay id cua game
    const { success, message, id } = await service.createNewGame(
      name,
      req.user.id
    );
    res.send({ success, message, id });
  },

  // Tham gia game
  POST_accessGame: async (req, res) => {
    const { idGame } = req.body;
    const idPlayer2 = req.user.id;
    const { success, message } = await service.accessGame(idGame, idPlayer2);
    res.send({ success, message });
  },

  // Gui tin nhan
  POST_sendMessage: async (req, res) => {
    const idUser = req.user.id;
    const { idGame, message: contentMessage } = req.body;

    const { success, message } = await service.sendMessage({
      idGame,
      idUser,
      message: contentMessage,
    });

    res.send({ success, message });
  },

  // Lay tin nhan
  GET_getMessage: async (req, res) => {
    const idRoom = req.query.id;
    const idUser = getIDUserFromToken(req.query.token);

    console.log("[GET MESSAGE]");

    const { success, message, listMessage } = await service.getMessage({
      idRoom,
      idUser,
    });

    console.log("List message:", listMessage);

    res.send({ success, message, data: { listMessage } });
  },

  // Di mot nuoc di
  POST_makeAMove: async (req, res) => {
    const { position } = req.body;
    const { id: idGame } = req.params;
    const idPlayer = req.user.id;
    const { success, message, move } = await service.makeAMove(
      idGame,
      idPlayer,
      position
    );
    // Broadcast
    if (success) {
      getIO().emit("update-board", move);
    }
    res.send({ success, message, data: { move } });
  },

  // Lay mot van choi
  GET_getGame: async (req, res) => {
    const idGame = req.params.id;
    const { success, message, game } = await service.getGame(idGame);
    res.send({ success, message, data: { game } });
  },

  POST_createNewRoom: async (req, res) => {
    const { id: idUser } = req.user;
    const { name, password, limitTime } = req.body;
    const { success, message, data } = await service.createNewRoom(
      idUser,
      name,
      password,
      limitTime
    );
    res.send({ success, message, data });
  },

  GET_getRoom: async (req, res) => {
    const { id: idRoom, token } = req.query;

    const idUser = getIDUserFromToken(token);

    const response = await service.getRoom(idUser, idRoom);
    res.send(response);
  },
};

module.exports = controller;
