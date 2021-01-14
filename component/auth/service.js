const jwt = require("jsonwebtoken");
const axiosClient = require("../../apiClient");
const { userModel } = require("../../database/schema");
const config = require("../../config");
const bcrypt = require("bcryptjs");
const { generateGUID, sendMail, generateUsername } = require("../../util");
const { service: serviceIO } = require("../../socket.io");
const date = new Date().getDate();
const month = new Date().getMonth() + 1;
const year = new Date().getFullYear();
const currentDate = date + "/" + month + "/" + year;
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
    console.log("User id in signin fb:", id);
    const url = `https://graph.facebook.com/${id}`;

    const query = {
      fields: "email,name,picture",
      access_token: `${accessToken}`,
    };

    try {
      // get in4 user on FB
      const response = await axiosClient.post(url, query);

      console.log("Response in auth facebook ", response);
      const { email, name, picture } = response;

      // check user in DB
      let user = await userModel.findOne({ email });

      // create new user if not exist
      if (!user) {
        user = await new userModel({
          createdDate: currentDate,
          email,
          avatarUrl: picture.data.url,
          fullname: name,
          username: generateUsername(name),
        }).save();
      }
      console.log("User : ", user);

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
      const { email, name, picture } = response;
      console.log("User gg:", response);
      // check user in DB
      let user = await userModel.findOne({ email });

      // create new user if not exist
      if (!user) {
        user = await new userModel({
          createdDate: currentDate,

          avatarUrl: picture,
          fullname: name,
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
          createdDate: currentDate,

          username,
          email,
          password: hashPassword,
          role: false,
          online: false,
          active: codeActive,
        }).save();

        // send mail active
        sendMail.sendMailActive(email, username, user.id, codeActive);

        return {
          success: true,
          message:
            "Sign up success, please check mail to activate your account",
        };
      }

      return { success: false, message: "Sign up failed, user already exist." };
    } catch (e) {
      console.log(`[ERROR-SIGNIN]: ${e.message}`);
      return { success: false, message: "Cannot connect to database." };
    }
  },

  activeAccount: async (id, code) => {
    console.log("code", code);
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
  getUser: async (id) => {
    const user = await userModel
      .findOne({ id })
      .select(
        "-_id email username id fullname avatarUrl totalGame totalGameLose totalGameWin cup createdDate"
      );

    const listUserRank = await userModel
      .find({})
      .select("-_id id cup")
      .sort({ cup: -1 });

    let rank = 1;
    for (let i = 0; i < listUserRank.length; i++) {
      if (listUserRank[i].id !== id) {
        rank++;
      } else break;
    }

    const {
      email,
      username,
      fullname,
      avatarUrl,
      totalGame,
      totalGameLose,
      totalGameWin,
      cup,
      createdDate,
    } = user;

    return {
      success: true,
      message: "Success",
      data: {
        email,
        username,
        id,
        fullname,
        avatarUrl,
        totalGame,
        totalGameLose,
        totalGameWin,
        cup,
        rank,
        totalUser: listUserRank.length,
        createdDate,
      },
    };
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      let user = await userModel.findOne({ id: userId });

      console.log("USER:", user);

      if (user) {
        if (!bcrypt.compareSync(oldPassword, user.password)) {
          return {
            success: false,
            message: "Incorrect old password",
            data: null,
          };
        }
        console.log("New password :", newPassword);
        const hashPassword = bcrypt.hashSync(
          newPassword,
          config.SECRET_KEY_HASH
        );
        user.password = hashPassword;
        await user.save();
        console.log("New password after hash :", user.password);

        return {
          success: true,
          message: "Change password success.",
          data: user,
        };
      }

      return {
        success: false,
        message: "Change password not success.",
        data: null,
      };
    } catch (e) {
      return {
        success: false,
        message: "Cannot connect to database.",
        data: null,
      };
    }
  },
  forgotPassword: async (email) => {
    try {
      console.log("Mail:", email);
      let user = await userModel.findOne({ email: email });

      console.log("USER:", user);
      if (!user) {
        return {
          success: false,
          message: "Cannot find user with that mail",
          data: null,
        };
      }
      if (user) {
        const newPassword = generateGUID();
        console.log("New password:", newPassword);
        const hashPassword = bcrypt.hashSync(
          newPassword,
          config.SECRET_KEY_HASH
        );
        user.password = hashPassword;
        await user.save();
        sendMail.sendMailResetPassword(email, user.username, newPassword);
        return {
          success: true,
          message: "Go to gmail to receive new password.",
          data: user,
        };
      }

      return {
        success: false,
        message: "Reset password not success.",
        data: null,
      };
    } catch (e) {
      return {
        success: false,
        message: "Cannot connect to database.",
        data: null,
      };
    }
  },

  updateUser: async (userId, avatarUrl, fullname) => {
    try {
      let user = await userModel.findOne({ id: userId });
      console.log("Check user:", user);
      if (!user) {
        return {
          success: false,
          message: "Cannot find user",
          data: null,
        };
      }
      if (user) {
        user.avatarUrl = avatarUrl;
        user.fullname = fullname;
        await user.save();
        console.log("Check user after update:", user);
        return {
          success: true,
          message: "Update profile successfully.",
          data: user,
        };
      }

      return {
        success: false,
        message: "Cannot update profile.",
        data: null,
      };
    } catch (e) {
      return {
        success: false,
        message: "Cannot connect to database.",
        data: null,
      };
    }
  },
  getListUserRank: async (limit) => {
    try {
      let userListRank = await userModel.find().sort({ cup: -1 }).limit(limit);

      console.log("USER list rank:", userListRank);
      if (!userListRank) {
        return {
          success: false,
          message: "Get list user rank failed",
          data: null,
        };
      }
      if (userListRank) {
        return {
          success: true,
          message: "Success.",
          data: userListRank,
        };
      }

      return {
        success: false,
        message: "Get list user rank failed",
        data: null,
      };
    } catch (e) {
      return {
        success: false,
        message: "Cannot connect to database.",
        data: null,
      };
    }
  },
};

// console.log(createMail.mailActive("1234"));

module.exports = service;
