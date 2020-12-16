let Game = require("../../database/schema/game");
let Square = require("../../database/schema/square");
const service = {
  createNewGame: async (name, player1) => {
    try {
      const newGame = await new Game({
        name,
        player1,
        player2: "Player2",
        squares: null,
      }).save();

      let squares = Array(900).fill(null);

      for (let i = 9; i < 900; i++) {
        const newSquare = new Square({
          value: squares[i],
          game: newGame.name,
        });
      }
      return { success: true, message: "Success", game: newGame };
    } catch (e) {
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed" };
    }
  },
  accessGame: async (idGame, idPlayer2) => {
    console.log("idPlayer2", idPlayer2);
    try {
      const game = await Game.findOne({ id: idGame });

      console.log("game", game);

      if (!game) {
        game.player2 = idPlayer2;

        game.save();
      }

      return { success: true, message: "Success" };
    } catch (e) {
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed" };
    }
  },
};

module.exports = service;
