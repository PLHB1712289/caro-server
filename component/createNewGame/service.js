const Game = require("../../database/schema/game");
const Square = require("../../database/schema/square");
const messageModel = require("../../database/schema/message");

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
  sendMessage: async ({ idGame, idUser, message }) => {
    const date = new Date();
    try {
      const newMessage = await new messageModel({
        idGame,
        idUser,
        message,
        date,
      }).save();

      return { success: true, message: "Send message success" };
    } catch (e) {
      console.log(`[ERROR-GAME]: ${e.message}`);
      return { success: false, message: "Send message failed" };
    }
  },

  getMessage: async ({ idGame, idUser }) => {
    try {
      const listMessage = await messageModel.find({ idGame });

      if (listMessage) {
        return {
          success: true,
          message: "Send message success",
          listMessage: listMessage.map((item) => {
            if (idUser === item.idUser) {
              return {
                contentMessage: item.message,
                username: "You",
                type: "1",
              };
            } else {
              return {
                contentMessage: item.message,
                username: "Player 2",
                type: "2",
              };
            }
          }),
        };
      }

      return { success: true, message: "Send message success", listMessage };
    } catch (e) {
      console.log(`[ERROR-GAME]: ${e.message}`);
      return {
        success: false,
        message: "Send message failed",
        listMessage: null,
      };
    }
  },
};

module.exports = service;
