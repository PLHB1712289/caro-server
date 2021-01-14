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
          "avatarUrl",
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

      const listRoomUsername = [];
      for (let i = 0; i < listRoom.length; i++) {
        const player1 = (await userModel
          .findOne({ id: listRoom[i].player1 })
          .select(["username"])) || { username: null };

        const player2 = (await userModel
          .findOne({ id: listRoom[i].player2 })
          .select(["username"])) || { username: null };

        listRoomUsername.push({
          no: i + 1,
          id: listRoom[i].idRoom,
          name: listRoom[i].name,
          status: !listRoom[i].gameCurrent ? "waiting" : "playing",
          isLock: listRoom[i].password ? true : false,
          player1: player1.username,
          player2: player2.username,
        });
      }

      return {
        success: true,
        message: "Get list room success",
        data: { listRoom: listRoomUsername },
      };
    } catch (e) {
      console.log(`[ERROR]: ${e.message}`);
      return { success: false, message: "Get list room failed", data: null };
    }
  },
};

module.exports = service;
