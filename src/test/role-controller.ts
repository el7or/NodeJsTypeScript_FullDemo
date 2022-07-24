import assert from 'assert';
import { expect } from 'chai';
import mongoose from 'mongoose';

import User from '../models/user';
import Role from '../models/role';
import { postRole } from '../controllers/roles';

describe('Role Controller', function () {
    before(function (done) {
        mongoose
            .connect(`mongodb+srv://node_test:node_test@cluster0.u9j79.mongodb.net/node_unit_test`)
            .then(result => {
                const user = new User({
                    name: 'Ali',
                    password: '123456',
                    age: 40,
                    description: 'testttttttt',
                    roleId: '62d03e2f1cc46f337c9bffe5',
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });

    // it('should add a created role successfully', function (done) {
    //     const req = {
    //         body: {
    //             name: 'Admin',
    //             description: 'testtttt',
    //         },
    //         userId: '5c0f66b979af55031b34728a'
    //     };
    //     const res = {
    //         statusCode: 500,
    //         message: "",
    //         result: null,
    //         status: function (code: number) {
    //             this.statusCode = code;
    //             return this;
    //         },
    //         json: function (data: any) {
    //             this.message = data.message;
    //             this.result = data.result;
    //         }
    //     };
    //     postRole(req, res, () => { }).then(() => {
    //         expect(res.statusCode).to.be.equal(201);
    //         expect(res.message).to.be.equal('Role created successfully!');
    //         expect(res.result).to.not.be.empty;
    //         done();
    //     }).catch(done);
    // });

    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return Role.deleteMany({});
            })
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});
