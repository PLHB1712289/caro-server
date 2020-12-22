const service = require("./service");

const controller = {
  GET_basic: async (req, res) => {
    const {
      success: successGetRoom,
      message: messageGetRoom,
      data: dataGetRoom,
    } = await service.getListRoomOnline();
    const {
      success: successGetUser,
      message: messageGetUser,
      data: dataGetUser,
    } = await service.getListUserOnline();

    res.send({
      success: successGetRoom && successGetUser,
      message: `${messageGetRoom}. ${messageGetUser}`,
      data: { ...dataGetRoom, ...dataGetUser },
    });
  },
};

module.exports = controller;
