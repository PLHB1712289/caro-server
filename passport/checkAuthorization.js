const passport = require("passport");

const checkAuthorization = () => {
  return passport.authenticate("jwt", { session: false });
};

module.exports = checkAuthorization;
