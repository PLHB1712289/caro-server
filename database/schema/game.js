const mongoose = require("mongoose");

module.exports = mongoose.model(
  "game",
  new mongoose.Schema({
    name: String,
    squares: [Number],
    player1: String,
    player2: String,
    nextMove: String,
  })
);

// Game
// |- squares     : String
// |- player1  : id
// |- player2   : String
//
