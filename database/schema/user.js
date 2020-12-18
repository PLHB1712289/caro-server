const mongoose = require("mongoose");

module.exports = mongoose.model(
  "user",
  new mongoose.Schema({
    fullname: String,
    password: String,
    email: String,
    online: Boolean,
  })
);

// User
// |- email     : String
// |- password  : String
// |- urlAvatar : String
//
