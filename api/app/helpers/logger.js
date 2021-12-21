const bunyan = require('bunyan');
const packageJson = require('../../package.json');

const logger = bunyan.createLogger({
    name: 'aquarius-api',
    streams: [
        {
            stream: process.stdout,
            level: process.env.NODE_ENV === 'production' ? bunyan.INFO : bunyan.DEBUG
        },
        {
            path: '/var/tmp/aquarius-api-errors.log',
            level: bunyan.ERROR
        }
    ],
    src: process.env.NODE_ENV !== 'production' ? true : false
})
if (process.env.MUTE_LOGGER === "true"){
    logger.level(bunyan.FATAL+1);
}

logger.info({NODE_ENV: process.env.NODE_ENV}, 'API Logger loaded.');

module.exports = { bunyan, logger };