const { check } = require("express-validator");

const signInValidators = [
    check('username').isString().not().isEmpty().trim(),
    check('password').isString().not().isEmpty().trim()
];

const signUpValidators = [
    check('name').isString().not().isEmpty().trim(),
    check('username').isString().isAlphanumeric("az-AZ", {ignore: '_-'}).isLength({min: 3, max: 16}).trim(),
    check('email').isString().isEmail().normalizeEmail().trim(),
    check('password').isString().isLength({min: 8}).trim(),
    check('gender').custom((val) => {
        if (val !== 'M' && val !== 'F') throw new Error('Valor no válido.')
        else return val;
    }),
    check('day').isInt({min: 1, max: 31}).isLength({min: 1, max: 2}),
    check('month').isInt({min: 1, max: 12}).isLength({min: 1, max: 2}),
    check('year').isInt({min: 1905, max: new Date().getFullYear()}).isLength({min: 4, max: 4}),
    check('termsChecked').isBoolean({strict: true})
];

const newPostValidators = [
    check('post_body').isString().not().isEmpty().trim(),
];

const newReplyValidators = [
    check('post_body').isString().not().isEmpty().trim()
];

const deleteReplyValidators = [
    check('post_id').isString().not().isEmpty().trim(),
    check('replied_post_id').isString().not().isEmpty().trim()
]

module.exports = {
    signInValidators,
    signUpValidators,
    newPostValidators,
    newReplyValidators,
    deleteReplyValidators
};