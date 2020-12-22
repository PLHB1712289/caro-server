const { roomModel, userModel } = require("../../database/schema");

const service = {
  getListUserOnline: async () => {
    try {
      const listUserOnline = await userModel
        .find({ isOnline: true })
        .select([
          "-_id",
          "username",
          "id",
          "totalGame",
          "totalGameWin",
          "totalGameLose",
        ]);

      return {
        success: true,
        message: "Get list user online success",
        data: { listUserOnline },
      };
    } catch (e) {
      console.log(`[ERROR-USER_ONLINE]: ${e.message}`);
      return {
        success: false,
        message: "Cannot get list user online",
        data: null,
      };
    }
  },
  getListRoomOnline: async () => {
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
