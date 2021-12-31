const {doQuery} = require('../../database/db-connection');

const createUser = async (accountValues, conn) => {
    const [resultNewAccount] = await doQuery('INSERT INTO users SET ?', [accountValues], conn);
    return resultNewAccount.insertId;
}

const findOneByUsernameOrEmail = async (usernameOrEmail, conn) => {
    const [user] = await doQuery(`
        SELECT 
        u.user_id,
        u.password
        FROM users AS u
        INNER JOIN users_profiles AS up ON up.user_id = u.user_id
        WHERE u.email = ? OR up.username = ?;
    `, [usernameOrEmail, usernameOrEmail], conn);
    return user[0];
}

const checkUserExists = async (id, conn) => {
    const [result] = await doQuery('SELECT user_id FROM users WHERE user_id=?;', [id], conn);
    return result[0].user_id;
}

module.exports = {
    createUser,
    findOneByUsernameOrEmail,
    checkUserExists
}