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
    console.log("Check id game of access game");
    console.log(req.body);
    const idPlayer2 = req.user.id;
    console.log("Check req.user cua access game");
    console.log(req.user);
    const { success, message } = await service.accessGame(idGame, idPlayer2);
    res.send({ success, message });
  },
};

module.exports = controller;
