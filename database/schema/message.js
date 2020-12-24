const mongoose = require("mongoose");

module.exports = mongoose.model(
  "message",
  new mongoose.Schema({
    idRoom: String,
    idUser: String,
    message: String,
    created_at: { type: Date, default: Date.now },
  })
);
