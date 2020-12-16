const service = require("./service");

const controller = {
  POST_createNewGame: async (req, res) => {
    const { name } = req.body;
    console.log(req.user);
    const { success, message,game } = await service.createNewGame(
        name
    );
    res.send({ success, message,game });
  },
  POST_accessGame: async (req, res) => {
    const { idGame } = req.body;
    console.log(req.user);
    const { success, message } = await service.accessGame(
        idGame
    );
    res.send({ success, message });
  },
};

module.exports = controller;
