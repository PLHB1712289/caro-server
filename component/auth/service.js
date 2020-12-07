const jwt = require("jsonwebtoken");
const axiosClient = require("../../apiClient");
const { userModel } = require("../../database/schema");
const config = require("../../config");

const service = {
  signIn: (username, password) => {},
  signInWithFB: async (id, accessToken) => {
    const url = `https://graph.facebook.com/${id}`;

    const query = {
      fields: "email",
      access_token: `${accessToken}`,
    };

    try {
      // get in4 user on FB
      const response = await axiosClient.post(url, query);
      const { email } = response;

      // check user in DB
      let user = await userModel.findOne({ email });

      // create new user if not exist
      if (!user) {
        user = await new userModel({ email }).save();
      }

      // create payload to sign with JWT
      const payload = {
        id: user._id,
      };

      // create token JWT
      const token = jwt.sign(payload, config.SECRET_KEY_JWT);

      // return Success
      return { success: true, message: "Success", token };
    } catch (e) {
      // When id or accesstoken is not good, FB will throw error
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed", token: null };
    }
  },
  signInWithGG: async (id, accessToken) => {
    const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id}`;

    const query = {};

    try {
      // get in4 user on FB
      const response = await axiosClient.post(url, query);
      const { email } = response;

      // check user in DB
      let user = await userModel.findOne({ email });

      // create new user if not exist
      if (!user) {
        user = await new userModel({ email }).save();
      }

      // create payload to sign with JWT
      const payload = {
        id: user._id,
      };

      // create token JWT
      const token = jwt.sign(payload, config.SECRET_KEY_JWT);

      // return Success
      return { success: true, message: "Success", token };
    } catch (e) {
      // When id or accesstoken is not good, GG will throw error
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed", token: null };
    }
  },
};

module.exports = service;
