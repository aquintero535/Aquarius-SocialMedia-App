const logger = require('./logger').logger.child({module: 'handleValidationError'});
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/api-errors');

const handleValidationError = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error(errors, 'This request could not be executed because of validation errors.');
        throw new BadRequestError();
    }
    next();
};

module.exports = handleValidationError;