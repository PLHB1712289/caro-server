const jwt = require("jsonwebtoken");
const axiosClient = require("../../apiClient");
const { userModel } = require("../../database/schema");
const config = require("../../config");
const bcrypt = require("bcryptjs");
let Game = require('../../database/schema/game');
let Square=require("../../database/schema/square");
const service = {
  createNewGame: async (name,player1 ) => {
    console.log(name );
    console.log(req.user.id);

    try {
      const newGame=new Game({
          name:name,
          player1:"Player 1",
          player2:"Player 2",
          squares:null,
      });
      console.log("Check new game");
      console.log(newGame);
      newGame.save();
      let squares=Array(900).fill(null);
      for(let i=9;i<900;i++)
      {
          const newSquare=new Square({
            value:squares[i],
            game:newGame.name,
          })
      }
      return { success: true, message: "Success" ,game:newGame};

    } catch (e) {
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed" };
    }
  },
  accessGame: async (idGame) => {
    console.log(idGame );
    try {
      Game.findById(idGame,(err,game)=>{
        if(!game) return { success: false, message: "Not have game" };

        else {
          console.log(game);
          game.player2="player 2 id";

          game.save();
        }
      });

      return { success: true, message: "Success" };

    } catch (e) {
      console.log("[ERROR]: ", e.message);

      // return Failed
      return { success: false, message: "Failed" };
    }
  },




};

module.exports = service;
