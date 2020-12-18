const service = require("./service");

const controller = {
  POST_signIn: async (req, res) => {
    const { username, password } = req.body;

    const { success, message, token } = await service.signIn(
      username,
      password
    );

    res.send({ success, message, token });
  },
  POST_signInWithFB: async (req, res) => {
    const { id, accessToken } = req.body;

    const { success, message, token } = await service.signInWithFB(
      id,
      accessToken
    );

    res.send({ success, message, token });
  },

  POST_signInWithGG: async (req, res) => {
    const { id, accessToken } = req.body;

    const { success, message, token } = await service.signInWithGG(
      id,
      accessToken
    );

    res.send({ success, message, token });
  },

  GET_userOnline: async (req, res) => {
    const { success, message, data } = await service.getUserOnline();

    res.send({ success, message, data });
  },

  POST_signUp: async (req, res) => {
    const { username, email, password } = req.body;
    console.log("req.body", req.body);

    const { success, message } = await service.signUp(
      username,
      email,
      password
    );

    res.send({ success, message });
  },
};

module.exports = controller;
