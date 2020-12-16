const mongoose = require("mongoose");

module.exports = mongoose.model(
  "message",
  new mongoose.Schema({
    idGame: String,
    idUser: String,
    message: String,
    date: Number,
  })
);
