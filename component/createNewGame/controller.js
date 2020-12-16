const service = require("./service");

const controller = {
  POST_createNewGame: async (req, res) => {
    const { name,player1,player2 } = req.body;

    const { success, message } = await service.createNewGame(
        name,player1,player2
    );

    res.send({ success, message });
  },

};

module.exports = controller;
