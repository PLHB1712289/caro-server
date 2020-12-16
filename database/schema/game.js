const mongoose = require("mongoose");

module.exports = mongoose.model(
    "game",
    new mongoose.Schema({
        name: String,
        squares:Array(900).fill(null),
        player1: String,
        player1: String,
    })
);

// Game
// |- squares     : String
// |- player1  : id
// |- player2   : String
//

