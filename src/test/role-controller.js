const assert = require('assert');
const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const Role = require('../models/role');
const RoleController = require('../controllers/roles');

describe('Role Controller', function () {
    before(function (done) {
        mongoose
            .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u9j79.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`)
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

    it('should add a created role successfully', function (done) {
        const req = {
            body: {
                name: 'Admin',
                description: 'testtttt',
            },
            userId: '5c0f66b979af55031b34728a'
        };
        const res = {
            statusCode: 500,
            message: "",
            result: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.message = data.message;
                this.result = data.result;
            }
        };
        RoleController.postRole(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(201);
            expect(res.message).to.be.equal('Role created successfully!');
            expect(res.result).to.not.be.empty;
            done();
        }).catch(done);
    });

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
