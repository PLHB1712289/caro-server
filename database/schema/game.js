const mongoose = require("mongoose");

module.exports = mongoose.model(
  "game",
  new mongoose.Schema({
    name: String,
    squares: {
      type: [
        {
          position: Number,
          checker: Number,
          created_at: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    player1: String,
    player2: { type: String, default: null },
    nextMove: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now },
  })
);
