const mongoose = require("mongoose");

module.exports = mongoose.model(
  "user",
  new mongoose.Schema({
    password: String,
    email: String,
    urlAvatar: String,
  })
);

// User
// |- email     : String
// |- password  : String
// |- urlAvatar : String
//
