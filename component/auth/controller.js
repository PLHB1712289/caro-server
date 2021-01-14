const service = require("./service");

const controller = {
  POST_signIn: async (req, res) => {
    const { username, password } = req.body;

    const { success, message, token } = await service.signIn(
      username,
      password
    );

    res.send({ success, message, data: { token } });
  },
  POST_signInWithFB: async (req, res) => {
    const { id, accessToken } = req.body;

    const { success, message, token } = await service.signInWithFB(
      id,
      accessToken
    );

    res.send({ success, message, data: { token } });
  },

  POST_signInWithGG: async (req, res) => {
    const { id, accessToken } = req.body;

    const { success, message, token } = await service.signInWithGG(
      id,
      accessToken
    );

    res.send({ success, message, data: { token } });
  },

  POST_signUp: async (req, res) => {
    const { username, email, password } = req.body;

    const { success, message } = await service.signUp(
      username,
      email,
      password
    );

    res.send({ success, message });
  },

  GET_active: async (req, res) => {
    const { id, code } = req.query;
    console.log(id, code);

    const { message } = await service.activeAccount(id, code);

    res.send(message);
  },
  GET_user: async (req, res) => {
    const userId = req.user.id;
    console.log("This is user id ", req.user.id);
    const { success, message, data } = await service.getUser(userId);
    res.send({ success, message, data });
  },
  GET_user_by_id: async (req, res) => {
    const { userId } = req.body;

    const { success, message, data } = await service.getUser(userId);
    res.send({ success, message, data });
  },
  POST_changePassword: async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const { success, message, data } = await service.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    res.send({ success, message, data });
  },
  POST_forgotPassword: async (req, res) => {
    console.log("Controller check req.body:", req.body);
    const { email } = req.body;
    console.log("Controller mail:", email);
    const { success, message, data } = await service.forgotPassword(email);
    res.send({ success, message, data });
  },

  POST_updateUser: async (req, res) => {
    const { avatarUrl, fullname } = req.body;
    const userId = req.user.id;
    const { success, message, data } = await service.updateUser(
      userId,
      avatarUrl,
      fullname
    );
    res.send({ success, message, data });
  },
  GET_list_user_rank: async (req, res) => {
    const limit = 20;
    const { success, message, data } = await service.getListUserRank(limit);
    res.send({ success, message, data });
  },
};

module.exports = controller;
