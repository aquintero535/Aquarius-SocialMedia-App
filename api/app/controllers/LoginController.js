const db = require('../database/db-connection');
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt');
const { validationResult } = require('express-validator');
const { deleteAtFromUsername } = require('../utils/fixUsername');
const { logger } = require('../helpers/logger');
const moduleLogger = logger.child({module: 'LoginController'});

const secretKey = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN;
const saltRounds = process.env.PWD_SALT_ROUNDS || 10;

const signIn = async function(req, res) {
    let conn = null;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) throw errors
        let usernameOrEmail = deleteAtFromUsername(req.body.username);
        conn = await db.getConnection();
        let [user] = await db.query(`
            SELECT u.user_id, u.password
            FROM users AS u
            INNER JOIN users_profiles AS up ON up.user_id = u.user_id
            WHERE u.email = ? OR up.username = ?;
        `, [usernameOrEmail, usernameOrEmail]);
        if (!user[0]) {
            moduleLogger.debug({usernameOrEmail}, 'User not found.');
            return res.status(401).json({errors: [{message: 'Los datos introducidos no son válidos.'}]});
        }
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) {
            moduleLogger.debug('Password doesn\'t match');
            return res.status(401).json({errors: [{message: 'Los datos introducidos no son válidos.'}]});
        }
        let [userData] = await db.query(`
            SELECT profile_name, profile_image,
            username, followers, following
            FROM users_profiles WHERE user_id = ?;
        `, [user[0].user_id]);
        moduleLogger.debug('Generating new token: ', {expiresIn});
        const token = jwt.sign({user_id: user[0].user_id}, secretKey, {expiresIn});
        res.status(200).json({data: {user: {...userData[0], user_id: user[0].user_id}, auth_token: token}});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when signing in');
        res.status(500).json({errors: [{message: 'Unexpected error'}]});
    } finally {
        conn?.release();
    }
}

const signUp = async function(req, res) {
    let conn = null;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) throw errors;
        let birthday = new Date(req.body.year, req.body.month-1, req.body.day);
        moduleLogger.debug('Generating new hash password.', {saltRounds});
        const password = await bcrypt.hash(req.body.password, saltRounds);
        let accountValues = {email: req.body.email, password: password, birthday: birthday, gender: req.body.gender};
        moduleLogger.debug({accountValues}, 'Creating new user account...');
        conn = await db.getConnection();
        let [resultNewAccount] = await conn.query('INSERT INTO users SET ?', [accountValues]);
        moduleLogger.debug({user_id: resultNewAccount.insertId}, 'New user account created.');
        let profileValues = {user_id: resultNewAccount.insertId, profile_name: req.body.name, username: req.body.username};
        moduleLogger.debug({profileValues}, 'Creating new user profile...');
        await conn.query('INSERT INTO users_profiles SET ?', [profileValues]);
        moduleLogger.debug({username: profileValues.username}, 'New user profile created.');
        res.status(200).json({data: {success: true, message: 'Nueva cuenta creada.'}});
    } catch (error) {
        moduleLogger.error(error, 'Sign up failed.');
        res.status(500).json({errors: [{message: 'Unexpected error'}]});
    } finally {
        conn?.release();
    }
}


const checkUserExists = function(user_id) {
    moduleLogger.debug(`Checking user id: ${user_id} exists...`);
    return new Promise(async function(resolve, reject){
        try {
            let [data] = await db.query(`
                SELECT user_id FROM users WHERE user_id=?;
            `, [user_id]);
            if (!data[0]) {
                moduleLogger.debug(`User id: ${user_id} doesn't exist.`);
                return reject('This user doesn\'t exist.');
            }
            else resolve(data[0]);
        } catch (error) {
            moduleLogger.error(error, 'Error when checking if user exists.');
            reject(error)
        }
    });
}

module.exports = {signIn, signUp, checkUserExists};