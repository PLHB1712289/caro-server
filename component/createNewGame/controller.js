const service = require("./service");

const controller = {
  POST_createNewGame: async (req, res) => {
    const { name } = req.body;
    console.log(req.user);
    const { success, message, game } = await service.createNewGame(
      name,
      req.user.id
    );
    res.send({ success, message, game });
  },

  POST_accessGame: async (req, res) => {
    const { idGame } = req.body;
    const idPlayer2 = req.user.id;
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
};

module.exports = controller;
