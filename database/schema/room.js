const mongoose = require("mongoose");
const { generateIDRoom } = require("../../util");

module.exports = mongoose.model(
  "room",
  new mongoose.Schema({
    idRoom: { type: String, default: generateIDRoom },
    name: { type: String, default: "Room Caro" },
    gameCurrent: { type: String, default: null },
    password: { type: String, default: null },
    player1: String,
    player2: { type: String, default: null },
    isOpen: { type: Boolean, default: true }, // true: open, false: close
    created_at: { type: Date, default: Date.now },
  })
);

// User
// |- email     : String
// |- password  : String
// |- urlAvatar : String
//
