const passport = require("passport");
const { UnauthorizedError } = require("../utils/api-errors");
const logger = require('../helpers/logger').logger.child({module: 'withAuthMiddleware'});

const withAuth = (req, res, next) => {
    logger.debug('Authenticating JWT...');
    return passport.authenticate('jwt', {session: false}, (err, user) => {
        if (err) return next(err);
        if (!user) {
            logger.error('You have to be signed in to perform this action.');
            throw new UnauthorizedError('You have to be signed in to perform this action.');
        }
        req.user = {user_id: user};
        next();
    })(req, res, next);
};

module.exports = withAuth;
