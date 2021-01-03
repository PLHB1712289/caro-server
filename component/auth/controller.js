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
};

module.exports = controller;
