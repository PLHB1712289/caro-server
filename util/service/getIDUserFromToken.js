const jwt_decode = require("jwt-decode");

const getIDUserFromToken = (token) => {
  return jwt_decode(token).id;
};

module.exports = getIDUserFromToken;
