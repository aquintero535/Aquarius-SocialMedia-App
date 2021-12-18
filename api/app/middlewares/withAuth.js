const passport = require("passport");
const { logger } = require('../helpers/logger');
const moduleLogger = logger.child({module: 'withAuthMiddleware'});

const withAuth = (req, res, next) => {
    moduleLogger.debug('Authenticating JWT...');
    return passport.authenticate('jwt', {session: false}, (err, user) => {
        if (err) return next(err);
        if (!user) {
            moduleLogger.error('You have to be signed in to perform this action.');
            return res.status(401).json({errors: [{message: 'You have to be signed in to perform this action.'}]});
        }
        req.user = {user_id: user};
        next();
    })(req, res, next);
};

module.exports = withAuth;
