const { messageModel, gameModel, roomModel } = require("../../database/schema");
const { generateIDRoom } = require("../../util");

const service = {
  createNewGame: async (name, player1) => {
    try {
      const newGame = await new Game({
        name,
        player1,
      }).save();
      return { success: true, message: "Success", id: newGame._id };
    } catch (e) {
      console.log("[ERROR]: ", e.message);
      return { success: false, message: "Failed" };
    }
  },

  accessGame: async (idGame, idPlayer2) => {
    try {
      const game = await gameModel.findOne({ _id: idGame });
      if (game && !game.player2) {
        game.player2 = idPlayer2;
        game.save();
      }
      return { success: true, message: "Success" };
    } catch (e) {
      console.log("[ERROR]: ", e.message);
      return { success: false, message: "Failed" };
    }
  },

  sendMessage: async ({ idGame, idUser, message }) => {
    try {
      const newMessage = await new messageModel({
        idGame,
        idUser,
        message,
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
      const game = await gameModel.findOne({ _id: idGame });
      return { success: true, message: "Success", game };
    } catch (e) {
      console.log("[ERROR]: ", e.message);
      return { success: false, message: "Failed" };
    }
  },

  makeAMove: async (idGame, idPlayer, position) => {
    try {
      const game = await gameModel.findOne({ _id: idGame });
      if (game) {
        // Kiem tra da co nguoi choi 2 chua
        if (!game.player2) throw new Error("Vui long cho nguoi choi 2");
        // Lay thu tu cua nguoi choi
        let playerNumber =
          idPlayer === game.player1 ? 1 : idPlayer === game.player2 ? 2 : null;
        if (game.nextMove !== playerNumber)
          throw new Error("Nguoi choi khong duoc di nuoc di nay");
        // Kiem tra o da co nguoi di chua
        if (game.squares.find((square) => square.position === position))
          throw new Error("O nay da co nguoi di");
        // Update nguoi di ke tiep
        game.nextMove = (playerNumber % 2) + 1;
        // Update ban co
        game.squares.push({
          position,
          checker: playerNumber,
        });
        game.save();
        return {
          success: true,
          message: "Success",
          move: { position, checker: playerNumber },
        };
      } else {
        throw new Error("Ban choi khong ton tai");
      }
    } catch (e) {
      console.log("[ERROR]: ", e.message);
      return { success: false, message: "Failed" };
    }
  },

  getListRoom: async () => {
    try {
      // await new roomModel({
      //   name: "baobao",
      //   player1: "bao",
      //   player2: "hoai",
      // }).save();

      const listRoom = await roomModel
        .find({ isOpen: true })
        .select([
          "-_id",
          "idRoom",
          "name",
          "gameCurrent",
          "password",
          "player1",
          "player2",
        ])
        .sort("field: -created_at");

      return {
        success: true,
        message: "Get list room success",
        data: {
          listRoom: listRoom.map((item, index) => {
            const {
              idRoom: id,
              name,
              gameCurrent,
              password,
              player1,
              player2,
            } = item;
            return {
              no: index + 1,
              id,
              name,
              status: !gameCurrent ? "waiting" : "playing",
              isLock: password ? true : false,
              player1,
              player2,
            };
          }),
        },
      };
    } catch (e) {
      console.log(`[ERROR]: ${e.message}`);
      return { success: false, message: "Get list room failed", data: null };
    }
  },
};

module.exports = service;
