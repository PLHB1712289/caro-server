const mongoose = require("mongoose");

module.exports = mongoose.model(
  "move",
  new mongoose.Schema({
    idRoom: String,
    idGame: String,
    board: Array,
    order: Number, // moves in game: 1,2,3,4,...
    created_at: { type: Date, default: Date.now },
  })
);
