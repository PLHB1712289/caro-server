const jwt = require("jsonwebtoken");
const axiosClient = require("../../apiClient");
const { userModel } = require("../../database/schema");
const config = require("../../config");
const bcrypt = require("bcryptjs");
const { generateGUID, sendMail, generateUsername } = require("../../util");
const { service: serviceIO } = require("../../socket.io");

const service = {
  signIn: async (username, password) => {
    console.log(username, password);
    try {
      // check user in DB
      let user = await userModel.findOne({ username });

      //
      if (user) {
        // check active status
        if (user.active !== "activated") {
          return { success: false, message: "Account is locked", token: null };
        }

        // check password
        const passwordHash = user.password || "";
        if (!bcrypt.compareSync(password, passwordHash)) {
          return { success: false, message: "Incorrect password", token: null };
        }

        // create payload to sign with JWT
        const payload = {
          id: user.id,
        };

        // create token JWT
        const token = jwt.sign(payload, config.SECRET_KEY_JWT);

        user.isOnline = true;
        await user.save();

        serviceIO.updateUserOnline(user);
        // return Success
        return { success: true, message: "Success", token };
      }

      return { success: false, message: "User does not exist", token: null };
    } catch (e) {
      // When id or accesstoken is not good, FB will throw error
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed", token: null };
    }
  },
  signInWithFB: async (id, accessToken) => {
    const url = `https://graph.facebook.com/${id}`;

    const query = {
      fields: "email,name",
      access_token: `${accessToken}`,
    };

    try {
      // get in4 user on FB
      const response = await axiosClient.post(url, query);
      const { email, name } = response;

      // check user in DB
      let user = await userModel.findOne({ email });

      // create new user if not exist
      if (!user) {
        user = await new userModel({
          email,
          username: generateUsername(name),
        }).save();
      }

      // create payload to sign with JWT
      const payload = {
        id: user.id,
      };

      // create token JWT
      const token = jwt.sign(payload, config.SECRET_KEY_JWT);

      user.isOnline = true;
      await user.save();
      serviceIO.updateUserOnline(user);
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
      const { email, name } = response;

      // check user in DB
      let user = await userModel.findOne({ email });

      // create new user if not exist
      if (!user) {
        user = await new userModel({
          email,
          username: generateUsername(name),
        }).save();
      }

      // create payload to sign with JWT
      const payload = {
        id: user.id,
      };

      // create token JWT
      const token = jwt.sign(payload, config.SECRET_KEY_JWT);

      user.isOnline = true;
      await user.save();

      serviceIO.updateUserOnline(user);
      // return Success
      return { success: true, message: "Success", token };
    } catch (e) {
      // When id or accesstoken is not good, GG will throw error
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed", token: null };
    }
  },

  signUp: async (username, email, password) => {
    try {
      let user = await userModel.findOne({ username });
      let userEmail = await userModel.findOne({ email });

      if (userEmail) {
        return {
          success: false,
          message: "Email is already in used, please use another email!",
        };
      }

      if (!user) {
        const hashPassword = bcrypt.hashSync(password, config.SECRET_KEY_HASH);
        const codeActive = generateGUID();

        user = await new userModel({
          username,
          email,
          password: hashPassword,
          role: false,
          online: false,
          active: codeActive,
        }).save();

        // send mail active
        sendMail.sendMailActive(email, username, user._id, codeActive);

        return {
          success: true,
          message:
            "Sign in success, please check mail to activate your account",
        };
      }

      return { success: false, message: "Sign up failed, user already exist." };
    } catch (e) {
      console.log(`[ERROR-SIGNIN]: ${e.message}`);
      return { success: false, message: "Cannot connect to database." };
    }
  },

  activeAccount: async (id, code) => {
    try {
      const user = await userModel.findOne({ id: id, active: code });

      if (user) {
        user.active = "activated";
        await user.save();
        return {
          success: true,
          message: `Active account success, access <a href="${config.URL_CLIENT}"> caro </a> to sign in.`,
        };
      }

      return { success: false, message: "Active account failed." };
    } catch (e) {
      return { success: false, message: "Cannot connect to database." };
    }
  },
};

// console.log(createMail.mailActive("1234"));

module.exports = service;
