import { Router } from 'express';
import { body } from 'express-validator';

import { getRoles, getRole, postRole, putRole, deleteRole } from '../controllers/roles';
import Role from '../models/role';
import isAuth from '../middleware/is-auth';
import isAdmin from '../middleware/is-admin';

const router = Router();

const roleValidators = (isAdd: boolean): any => {
    return [
        body('name')
            .not().isEmpty()
            .withMessage('This field is required.')
            .isLength({ min: 3 })
            .withMessage('This field at least 3 characters.')
            .custom((value, { req }) => {
                return Role.findOne(isAdd ? { name: value } : { name: req.body.name, _id: { $ne: req.params!.id } }).then((oldUser: any) => {
                    if (oldUser) {
                        return Promise.reject('Role name exists already, please pick a different one.');
                    }
                });
            })
            .trim(),
        body('description')
            .not().isEmpty()
            .withMessage('This field is required.')
            .isLength({ min: 4, max: 400 })
            .withMessage('This field must be between 4 and 400 characters.')
    ]
}

// GET /roles
router.get('/roles', isAuth, getRoles
    // #swagger.tags = ['Roles']
);

// GET /roles/5
router.get('/role/:id', isAuth, getRole
    // #swagger.tags = ['Roles']
);

// POST /roles
router.post('/role/', [isAuth, roleValidators(true)], postRole
    // #swagger.tags = ['Roles']
);

// PUT /roles/5
router.put('/role/:id', [isAuth, roleValidators(false)], putRole
    // #swagger.tags = ['Roles']
);

// DELETE /roles/5
router.delete('/role/:id', [isAuth, isAdmin], deleteRole
    // #swagger.tags = ['Roles']
);

export default router;