const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { checkUserExists } = require('../components/auth/auth.service');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY,
};
  
//Verifies that the user exists.
passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    checkUserExists(jwt_payload.user_id)
    .then((data) => done(null, data))
    .catch((err) => done(err, null));
}));

module.exports = jwtOptions;