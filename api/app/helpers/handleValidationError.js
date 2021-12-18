const logger = require('../helpers/logger').logger.child({module: 'handleValidationError'});
const { validationResult } = require('express-validator');

const handleValidationError = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error(errors, 'This request could not be executed because of validation errors.');
        return res.status(400).json({error: {message: 'Los datos introducidos no son válidos.'}});
    }
    next();
};

module.exports = handleValidationError;