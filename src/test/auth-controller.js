const assert = require('assert');
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller', function () {
    before(function (done) {
        mongoose
            .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u9j79.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`)
            .then(result => {
                const user = new User({
                    name: 'Ali',
                    password: '123456',
                    age: 40,
                    description: 'testttttttt',
                    roleId: '62d03e2f1cc46f337c9bffe5'
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });

    beforeEach(function () { });

    afterEach(function () { });

    it('should throw an error with code 500 if accessing the database fails', function (done) {
        sinon.stub(User, 'findOne');
        User.findOne.throws();
        const req = {
            body: { name: 'Ali', password: '123456' }
        };
        AuthController.login(req, {}, () => { }).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        });
        User.findOne.restore();
    });

    it('should add a created user if signup', function (done) {
        const req = {
            body: {
                name: 'Ali2',
                password: '123456',
                age: 40,
                description: 'testttttttt',
                roleId: '62d03e2f1cc46f337c9bffe5',
                _id: '5c0f66b979af55031b34728a'
            },
            file: {
                path: 'some image'
            }
        };
        const res = {
            statusCode: 500,
            message: "",
            userId: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userId = data.userId;
                this.message = data.message;
            }
        };
        AuthController.signup(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(201);
            expect(res.message).to.be.equal('User created!');
            expect(mongoose.isValidObjectId(res.userId.toString())).to.be.true;
            done();
        }).catch(done);
    });

    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});
