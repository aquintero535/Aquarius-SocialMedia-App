const db = require('../../database/db-connection');
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt');

const User = require('./user.model');
const UserProfile = require('../profile/profile.model');
const { UnauthorizedError } = require('../../utils/api-errors');

const logger = require('../../helpers/logger').logger.child({module: 'AuthService'});

const secretKey = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN;
const saltRounds = parseInt(process.env.PWD_SALT_ROUNDS || 10);

const signIn = async (usernameOrEmail, password) => {
    let conn = await db.pool.getConnection();        
    const user = await User.findOneByUsernameOrEmail(usernameOrEmail, conn);
    if (!user) {
        logger.debug({usernameOrEmail}, 'User not found.');
        throw new UnauthorizedError('Credentials are invalid.');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        logger.debug('Password doesn\'t match');
        throw new UnauthorizedError('Credentials are invalid.');
    }
    const userProfile = await UserProfile.findOneById(user.user_id, conn);
    conn.release();
    logger.debug('Generating new token: ', {expiresIn});
    const token = jwt.sign({user_id: user.user_id}, secretKey, {expiresIn});
    return {user: {...userProfile, user_id: user.user_id}, auth_token: token};
}

const signUp = async (accountValues, profileValues, password) => {
    logger.debug('Generating new hash password.', {saltRounds});
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    logger.debug({accountValues}, 'Creating new user account...');
    accountValues.password = hashedPassword;
    let conn = await db.pool.getConnection();
    const newUserId = await User.createUser(accountValues, conn);
    logger.debug({user_id: newUserId}, 'New user account created.');
    profileValues.user_id = newUserId;
    logger.debug({profileValues}, 'Creating new user profile...');
    await UserProfile.createProfile(profileValues, conn);
    conn.release();
    logger.debug({username: profileValues.username}, 'New user profile created.');
}

const checkUserExists = async (userId) => {
    logger.debug(`Checking user id: ${userId} exists...`);
    try {
        const result = await User.checkUserExists(userId);
        if (!result) {
            logger.debug(`User id: ${userId} doesn't exist.`);
            return Promise.reject('This user doesn\'t exist.');
        }
        else 
            return Promise.resolve(result);
    } catch (error) {
        logger.error(error, 'Error when checking if user exists.');
        throw new Error('Error when checking if user exists.');
    }
}

module.exports = {signIn, signUp, checkUserExists};