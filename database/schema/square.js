const mongoose = require("mongoose");

module.exports = mongoose.model(
    "square",
    new mongoose.Schema({
        game: String,
        value:String,
    })
);

