const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const configFile = require("../config");

const config = () => {
  // Config for Jwtstrategy
  const option = {};
  option.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  option.secretOrKey = configFile.SECRET_KEY_JWT;
  passport.use(
    new JwtStrategy(option, (jwt_payload, done) => {
      const user = { id: jwt_payload.id };
      return done(null, user);
    })
  );
};

module.exports = { config };
