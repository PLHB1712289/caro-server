const mongoose = require("mongoose");
const config = require("../config");

const connect = () => {
  mongoose.connect(config.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection
    .once("open", () => console.log("Database connection is successful!!"))
    .on("error", () => console.log("Database connection is failed!!"));
};

module.exports = { connect };
