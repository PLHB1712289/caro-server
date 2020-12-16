const messageModel = require("../../database/schema/message");
let Game = require("../../database/schema/game");
let Square = require("../../database/schema/square");
let History = require("../../database/schema/history");

const service = {
  createNewGame: async (name, player1) => {
    try {
      const newGame = await new Game({
        name,
        player1,
        player2: "Player2",
        squares: Array(900).fill(null),
        nextMove: player1,
      }).save();

      // let squares = Array(900).fill(null);

      // for (let i = 9; i < 900; i++) {
      //   const newSquare = new Square({
      //     value: squares[i],
      //     game: newGame.name,
      //   });
      // }
      return { success: true, message: "Success", id: newGame._id };
    } catch (e) {
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed" };
    }
  },
  accessGame: async (idGame, idPlayer2) => {
    console.log("idPlayer2", idPlayer2);
    try {
      const game = await Game.findOne({ _id: idGame });
      console.log("Check game in accessGame");
      console.log(idGame);
      console.log("game", game);
      console.log("Check id player 2");
      console.log(idPlayer2);
      if (game) {
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
  getGame: async (idGame) => {
    try {
      const game = await Game.findOne({ _id: idGame });

      return game;
    } catch (e) {
      console.log("[ERROR]: ", e.message);
    }
  },
  makeAMove: async (idGame, idPlayer, position) => {
    console.log("idPlayer", idPlayer);
    try {
      const game = await Game.findOne({ _id: idGame });

      console.log("game", game);

      if (game) {
        // if (game.nextMove !== idPlayer)
        //   throw new Error("Nguoi choi khong duoc di nuoc di nay");
        // Update nguoi di ke tiep
        game.nextMove = idPlayer === game.player1 ? game.player2 : game.player1;
        // Update ban co
        game.squares[position] = "x";
        console.log(game.squares[position]);
        game.save();
        // Them lich su di
        await new History({
          game: idGame,
          player: idPlayer,
          position,
        }).save();
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
