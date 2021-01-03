const mongoose = require("mongoose");

module.exports = mongoose.model(
  "game",
  new mongoose.Schema({
    idRoom: String,
    player1: String,
    player2: { type: String, default: null },
    status: { type: Boolean, default: true }, // true: playing - false: finished
    winner: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
  })
);
