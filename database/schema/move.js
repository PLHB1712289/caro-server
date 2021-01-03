const mongoose = require("mongoose");

const size = 20;

module.exports = mongoose.model(
  "move",
  new mongoose.Schema({
    idRoom: String,
    idGame: String,
    board: { type: Array, default: new Array(size * size).fill(null) },
    index: Number,
    order: Number, // moves in game: 1,2,3,4,...
    created_at: { type: Date, default: Date.now },
  })
);
