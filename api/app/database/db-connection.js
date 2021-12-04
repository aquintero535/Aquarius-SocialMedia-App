const mysql = require('mysql2/promise');
const { logger } = require('../helpers/logger');
const moduleLogger = logger.child({module: 'DatabaseConnection'});
const config = {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
};
moduleLogger.debug({config});

const pool = mysql.createPool(config);

pool.on('connection', (connection) => {
    moduleLogger.debug({thread_id: connection.threadId}, 'New connection to database.');
});

pool.on('acquire', (connection) => {
    moduleLogger.debug({thread_id: connection.threadId}, 'Acquired connection');
});

pool.on('release', (connection) => {
    moduleLogger.debug({thread_id: connection.threadId}, 'Connection to database released');
}); 

module.exports = pool;
