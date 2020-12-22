const generateGUID = require("./service/generateGUID");
const generateIDRoom = require("./service/generateIDRoom");
const generateIDUser = require("./service/generateIDUser");
const sendMail = require("./service/sendMail");

module.exports = { generateGUID, sendMail, generateIDRoom, generateIDUser };
