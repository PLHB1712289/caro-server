const mongoose = require("mongoose");

module.exports = mongoose.model(
  "user",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    online: Boolean,
    role: Boolean,
    active: String,
  })
);

// User
// |- email     : String
// |- password  : String
// |- urlAvatar : String
//
