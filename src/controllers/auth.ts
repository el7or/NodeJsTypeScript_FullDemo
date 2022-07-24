import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import User from '../models/user';
import deleteFile from '../util/file';
import { IError } from '../util/ierror';

declare global {
    interface Date {
        addHours(h: number): Date;
    }
}
Date.prototype.addHours = function (h: number): Date {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

interface RequestParams {
    id?: string;
}
interface ResponseBody {
}
interface RequestBody {
    name?: string;
    password?: string;
    age?: number;
    description?: string;
    roleId?: string;
}
interface RequestQuery {
    page?: number;
}
interface ResponseBody {
}

export const login = async (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new IError('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const name = req.body.name;
        const password = req.body.password!;
        let user: any = await User.findOne({ name: name }).populate('roleId', 'name');
        if (!user) {
            const error = new IError('A user with this name could not be found.');
            error.statusCode = 401;
            throw error;
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            const error = new IError('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                name: user.name,
                userId: user._id.toString(),
                roleName: user.roleId.name
            },
            'somesupersecretsecret',
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token: token,
            expiresIn: new Date().addHours(1)
            //userId: loginUser._id.toString()
        });
        return; // => need it only for unit test
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        return err; // => need it only for unit test
    }
};

export const signup = async (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new IError('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            deleteFile(req.file?.path);
            throw error;
        }
        const name = req.body.name;
        const age = req.body.age;
        const password = req.body.password!;
        const description = req.body.description;
        const roleId = req.body.roleId;
        const image = req.file;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: name,
            password: hashedPassword,
            age: age,
            description: description,
            roleId: roleId,
            imageUrl: image?.path
        });
        res.status(201).json({ message: 'User created!', userId: user._id });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};