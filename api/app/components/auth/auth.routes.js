const express = require('express');
const router = express.Router();
const { signIn, signUp } = require('./auth.controller');
const handleValidationError = require('../../helpers/handleValidationError');
const { signUpValidators, signInValidators } = require('../../utils/validations');

router.post('/signin', signInValidators, handleValidationError, signIn);
router.post('/signup', signUpValidators, handleValidationError, signUp);


module.exports = router;