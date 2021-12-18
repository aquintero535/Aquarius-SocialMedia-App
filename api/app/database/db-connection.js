const mysql = require('mysql2/promise');
const logger = require('../helpers/logger').logger.child({module: 'DatabaseConnection'});
const config = {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
};
logger.debug({config});

const pool = mysql.createPool(config);

pool.on('connection', (connection) => {
    logger.debug({thread_id: connection.threadId}, 'New connection to database.');
});

pool.on('acquire', (connection) => {
    logger.debug({thread_id: connection.threadId}, 'Acquired connection');
});

pool.on('release', (connection) => {
    logger.debug({thread_id: connection.threadId}, 'Connection to database released');
});

const doQuery = async (query, parameters, conn) => {
    return (conn) ? await conn.query(query, parameters) : pool.query(query, parameters);
}

module.exports = {pool, doQuery};
