const mongoose = require("mongoose");
const { generateIDUser } = require("../../util");

module.exports = mongoose.model(
  "user",
  new mongoose.Schema({
    id: { type: String, default: generateIDUser },
    username: String,
    email: String,
    password: { type: String, default: null },
    isOnline: { type: Boolean, default: false }, // true: online - false: offline
    isAdmin: { type: Boolean, default: false }, // true: admin - false: customer
    active: { type: String, default: "activated" },
    totalGame: { type: Number, default: 0 },
    totalGameWin: { type: Number, default: 0 },
    totalGameLose: { type: Number, default: 0 },
    avatarUrl:{type:String,default:null},
    fullname:{type:String,default:null},
    createdDate:{type:String}
  })
);

// User
// |- email     : String
// |- password  : String
// |- urlAvatar : String
//
