const express = require('express');
const { body, check } = require('express-validator');

const authController = require('../controllers/auth');
const { isRequired } = require('../middleware/validators');
const User = require('../models/user');
const Role = require('../models/role');

const router = express.Router();

const loginValidator = () => {
    return [isRequired('name'), isRequired('password')]
}

const signupValidators = () => {
    return [
        isRequired('name'),
        body('name')
            .isLength({ min: 3 })
            .withMessage('This field at least 3 characters.')
            .custom((value, { req }) => {
                return User.findOne({ name: value }).then(oldUser => {
                    if (oldUser) {
                        return Promise.reject('Username exists already, please pick a different one.');
                    }
                });
            })
            .trim(),
        body('password', 'Please enter a password with only numbers and text and at least 6 characters.')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('age')
            .not().isEmpty()
            .withMessage('This field is required.')
            .isFloat()
            .withMessage('Please enter vaild number.'),
        body('description')
            .not().isEmpty()
            .withMessage('This field is required.')
            .isLength({ min: 4, max: 400 })
            .withMessage('This field must be between 4 and 400 characters.'),
        body('roleId')
            .not().isEmpty()
            .withMessage('Please select the role.')
            .custom((value, { req }) => {
                return Role.findOne({ _id: value }).then(role => {
                    if (!role) {
                        return Promise.reject('Wrong roleId!');
                    }
                });
            }),
        check('image')
            .custom((value, { req }) => {
                if (!req.file) {
                    const error = new Error('No image provided.');
                    error.statusCode = 422;
                    throw error;
                }
                if (req.file && req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpg' && req.file.mimetype !== 'image/jpeg') {
                    const error = new Error('Attached file is not an image!');
                    error.statusCode = 422;
                    throw error;
                }
                return true;
            })
    ]
}

// POST /auth/login
router.post('/auth/login', loginValidator(), authController.login
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Some summary...'
    // #swagger.description = 'Some description...'
    //  #swagger.parameters['name'] = { description: 'Some description...' }
    /*  #swagger.parameters['name', 'password'] = {
                in: 'body',
                description: 'Some description...',
                schema: {
                    $name: 'Ali',
                    $password: '123456'
                }
        } */
);

// POST /auth/signup
router.post('/auth/signup', signupValidators(), authController.signup
    // #swagger.tags = ['Auth']
);

module.exports = router;