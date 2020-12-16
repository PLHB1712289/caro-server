const jwt = require("jsonwebtoken");
const axiosClient = require("../../apiClient");
const { userModel } = require("../../database/schema");
const config = require("../../config");
const bcrypt = require("bcryptjs");
let Game = require('../../database/schema/game');

const service = {
  createNewGame: async (name,player1,player2 ) => {
    console.log(name,player1,player2 );
    try {
      const newGame=new Game({
          name:name,
          player1:player1,
          player2:player2
      });
      newGame.save();
      return { success: true, message: "Success" };

    } catch (e) {
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed" };
    }
  },




};

module.exports = service;
