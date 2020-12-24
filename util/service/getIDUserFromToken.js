const jwt_decode = require("jwt-decode");

const getIDUserFromToken = (token) => {
  try {
    return jwt_decode(token).id;
  } catch (e) {
    console.log("[DECODE_TOKEN]:", e.message);
    return null;
  }
};

module.exports = getIDUserFromToken;
