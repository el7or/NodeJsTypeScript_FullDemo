import { body } from 'express-validator';

export const isEmail = (propName: any) => {
    return body(propName)
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail();
}

export const isRequired = (propName: any) => {
    return body(propName)
        .not().isEmpty()
        .withMessage(`This Field is required!`)
        .trim();
}