const mongoose = require("mongoose");

module.exports = mongoose.model(
  "history",
  new mongoose.Schema({
    game: String,
    player: String,
    position: Number,
    created: { type: Date, default: Date.now },
  })
);

// History
// |- squares     : String
// |- player1  : id
// |- player2   : String
//
