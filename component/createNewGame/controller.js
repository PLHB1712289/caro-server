const service = require("./service");
const { io } = require("../../socket.io");

const controller = {
  POST_createNewGame: async (req, res) => {
    const { name } = req.body;
    console.log(req.user);
    const { success, message, id } = await service.createNewGame(
      name,
      req.user.id
    );
    res.send({ success, message, id });
  },

  POST_accessGame: async (req, res) => {
    const { idGame } = req.body;
    console.log("Check id game of access game");
    console.log(req.body);
    const idPlayer2 = req.user.id;
    console.log("Check req.user cua access game");
    console.log(req.user);
    const { success, message } = await service.accessGame(idGame, idPlayer2);
    res.send({ success, message });
  },

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

  GET_getMessage: async (req, res) => {
    const idGame = req.query.id;
    const idUser = req.user.id;

    const { success, message, listMessage } = await service.getMessage({
      idGame,
      idUser,
    });

    res.send({ success, message, listMessage });
  },
  POST_makeAMove: async (req, res) => {
    const { idGame, position } = req.body;
    const idPlayer = req.user.id;
    const { success, message } = await service.makeAMove(
      idGame,
      idPlayer,
      position
    );
    // Broadcast
    if (success) {
      // do sth
    }
    res.send({ success, message });
  },

  GET_getGame: async (req, res) => {
    const idGame = req.params.id;
    const game = await service.getGame(idGame);
    res.send(game);
  },
};

module.exports = controller;
