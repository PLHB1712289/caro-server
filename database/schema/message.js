const mongoose = require("mongoose");

module.exports = mongoose.model(
  "message",
  new mongoose.Schema({
    idGame: String,
    idUser: String,
    message: String,
    created_at: { type: Date, default: Date.now },
  })
);
