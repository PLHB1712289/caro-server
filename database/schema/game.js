const mongoose = require("mongoose");

module.exports = mongoose.model(
  "game",
  new mongoose.Schema({
    name: String,
    squares: String,
    player1: String,
    player2: String,
  })
);

// Game
// |- squares     : String
// |- player1  : id
// |- player2   : String
//
