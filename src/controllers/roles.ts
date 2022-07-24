import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

import Role from '../models/role';
import { IError } from '../util/ierror';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
interface RequestParams {
  id?: string;
}
interface ResponseBody {
}
interface RequestBody {
  name?: string;
  description?: string;
}
interface RequestQuery {
  page?: number;
}
interface ResponseBody {
}

export const getRoles = (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems: number;
  Role.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      //return Role.findWithUsersCount()
      return Role.aggregate([
        { $lookup: { from: "users", localField: "_id", foreignField: "roleId", as: "usersCount" } },
        { $addFields: { usersCount: { $size: "$usersCount" } } }
      ])
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(roles => {
      res.status(200).json({
        message: 'Fetched roles successfully.',
        result: roles,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const getRole = (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
  const roleId = req.params.id;
  Role.findById(roleId)
    .then(role => {
      if (!role) {
        const error = new IError('Could not find role.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Role fetched.', result: role });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const postRole = async (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new IError('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const result = await Role.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.userId
    });
    res.status(201).json({
      message: 'Role created successfully!',
      result: result
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const putRole = (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
  const roleId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new IError('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  Role.findById(roleId)
    .then(role => {
      if (!role) {
        const error = new IError('Could not find role.');
        error.statusCode = 404;
        throw error;
      }
      role.name = req.body.name;
      role.description = req.body.description;
      role.updatedBy = req.userId;
      return role.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Role updated!', result: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const deleteRole = (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: Response<ResponseBody>, next: NextFunction) => {
  const roleId = req.params.id;
  Role.findById(roleId)
    .then(role => {
      if (!role) {
        const error = new IError('Could not find role.');
        error.statusCode = 404;
        throw error;
      }
      return Role.findByIdAndRemove(roleId);
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted role.', result: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
