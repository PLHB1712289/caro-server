const SOCKET_TAG = require("./data");
const { userModel } = require("../database/schema");

const ControllerUser = class {
  constructor() {
    this.listUserOnline = [];
    this.io = null;

    console.log("[CONTROLL USER]: Create new instance of ControlUserOnline");

    // (() => {
    //   setInterval(() => {
    //     console.log("[LIST_USER_ONLINE]:", this.listUserOnline);
    //   }, 5000);
    // })();
  }

  setIO(io) {
    this.io = io;
  }

  async userOnline(userID, socketUserID) {
    this.listUserOnline.push({
      idSocket: socketUserID,
      idUser: userID,
    });
    // Find user on database
    const user = await userModel
      .findOne({ id: userID })
      .select([
        "-_id",
        "id",
        "username",
        "totalGame",
        "totalGameWin",
        "totalGameLose",
      ]);
    // Update status isOnline
    await userModel.updateOne({ id: userID }, { isOnline: true });
    // Response for client
    this.io.emit(SOCKET_TAG.RESPONSE_USER_ONLINE, { user });
  }

  async userOffline(userID, socketUserID) {
    // Remove user in listUserOnline
    this.listUserOnline = this.listUserOnline.filter((item) => {
      if (item.idSocket !== socketUserID) return item;
    });

    // Update status isOnline
    await userModel.updateOne({ id: userID }, { isOnline: false });

    // Response for another client
    this.io.emit(SOCKET_TAG.RESPONSE_USER_OFFLINE, { user: { id: userID } });
  }

  async userDisconnect(socketUserID) {
    // Get user from listUserOnline
    let idUser = null;

    this.listUserOnline = this.listUserOnline.filter((item) => {
      if (item.idSocket !== socketUserID) return item;
      else idUser = item.idUser;
    });

    // Update status isOnline
    if (idUser) {
      await userModel.updateOne({ id: idUser }, { isOnline: false });

      // Response for client
      this.io.emit(SOCKET_TAG.RESPONSE_USER_OFFLINE, { user: { id: idUser } });
    }
  }

  getUserID(socketID) {
    for (let i = 0; i < this.listUserOnline.length; i++) {
      if (this.listUserOnline[i].idSocket === socketID)
        return this.listUserOnline[i].idUser;
    }

    return null;
  }

  getSocketID(userID) {
    for (let i = 0; i < this.listUserOnline.length; i++) {
      if (this.listUserOnline[i].idUser === userID)
        return this.listUserOnline[i].idSocket;
    }

    return null;
  }
};

const controllerUser = new ControllerUser();

module.exports = controllerUser;
