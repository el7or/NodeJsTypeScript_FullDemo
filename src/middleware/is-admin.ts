import jwt from 'jsonwebtoken';

import { IError } from '../util/ierror';

const isAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new IError('Not authenticated!');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken: any;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (err: any) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new IError('Not authenticated!');
        error.statusCode = 401;
        throw error;
    }
    if (decodedToken.roleName !== 'Admin') {
        const error = new IError(`Not authorized!`);
        error.statusCode = 403;
        throw error;
    }
    req.roleName = decodedToken.roleName;
    next();
};

export default isAdmin;