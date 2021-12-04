const express = require('express');
const router = express.Router();
const { signIn, signUp } = require('../controllers/LoginController');
const { signUpValidators, signInValidators } = require('../utils/validations');

router.post('/signin', signInValidators, signIn);
router.post('/signup', signUpValidators, signUp);


module.exports = router;