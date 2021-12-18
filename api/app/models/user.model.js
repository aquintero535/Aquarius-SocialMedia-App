const db = require('../database/db-connection');

const createUser = async (accountValues) => {
    const [resultNewAccount] = await db.query('INSERT INTO users SET ?', [accountValues]);
    return resultNewAccount.insertId;
}

const findOneByUsernameOrEmail = async (usernameOrEmail) => {
    const [user] = await db.query(`
        SELECT 
        u.user_id,
        u.password
        FROM users AS u
        INNER JOIN users_profiles AS up ON up.user_id = u.user_id
        WHERE u.email = ? OR up.username = ?;
    `, [usernameOrEmail, usernameOrEmail]);
    return user[0];
}

const checkUserExists = async (id) => {
    const [result] = await db.query('SELECT user_id FROM users WHERE user_id=?;', [id]);
    return result[0].user_id;
}

module.exports = {
    createUser,
    findOneByUsernameOrEmail,
    checkUserExists
}