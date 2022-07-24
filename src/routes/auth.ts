import { Router } from 'express';
import { body, check } from 'express-validator';

import { login, signup } from '../controllers/auth';
import { isRequired } from '../middleware/validators';
import User from '../models/user';
import Role from '../models/role';
import { IError } from '../util/ierror';

const router = Router();

const loginValidator = () => {
    return [isRequired('name'), isRequired('password')]
}

const signupValidators = () => {
    return [
        isRequired('name'),
        body('name')
            .isLength({ min: 3 })
            .withMessage('This field at least 3 characters.')
            .custom((value: any, { req }: any) => {
                return User.findOne({ name: value }).then((oldUser: any) => {
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
            .custom((value: any, { req }: any) => {
                return Role.findOne({ _id: value }).then((role: any) => {
                    if (!role) {
                        return Promise.reject('Wrong roleId!');
                    }
                });
            }),
        check('image')
            .custom((value: any, { req }: any) => {
                if (!req.file) {
                    const error = new IError('No image provided.');
                    error.statusCode = 422;
                    throw error;
                }
                if (req.file && req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpg' && req.file.mimetype !== 'image/jpeg') {
                    const error = new IError('Attached file is not an image!');
                    error.statusCode = 422;
                    throw error;
                }
                return true;
            })
    ]
}

// POST /auth/login
router.post('/auth/login', loginValidator(), login
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
router.post('/auth/signup', signupValidators(), signup
    // #swagger.tags = ['Auth']
);

export default router;