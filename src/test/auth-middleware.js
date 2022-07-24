const assert = require('assert');
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function () {
  it('should throw the error "Not authenticated." if no authorization header', function () {
    const req = {
      get: function (headerName) {
        return null;
      }
    };

    assert.throws(function () { authMiddleware(req, {}, () => { }) }, new Error('Not authenticated.'));
    //expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not authenticated.');
  });

  it('should throw an error if the authorization header is only one string ("Bearer without token")', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer ';
      }
    };
    assert.throws(function () { authMiddleware(req, {}, () => { }) });
    //expect(authMiddleware.bind(this, req, {}, () => { })).to.throw();
  });

  it('should yield a userId after decoding the token', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer ' + jwt.sign({ userId: 'abc' }, 'somesupersecretsecret');
      }
    };
    authMiddleware(req, {}, () => { });
    assert.ok(req.hasOwnProperty('userId'));
    assert.equal(req.userId, 'abc');

    // const req = {
    //   get: function(headerName) {
    //     return 'Bearer djfkalsdjfaslfjdlas';
    //   }
    // };
    // sinon.stub(jwt, 'verify'); //=> to replace base method with new implementation
    // jwt.verify.returns({ userId: 'abc' });
    // authMiddleware(req, {}, () => {});
    // expect(req).to.have.property('userId');
    // expect(req).to.have.property('userId', 'abc');
    // expect(jwt.verify.called).to.be.true;
    // jwt.verify.restore(); //=> to restore base method
  });

  it('should throw an error if the token cannot be verified', function () {
    const req = {
      get: function (headerName) {
        return 'Bearer xyz';
      }
    };
    assert.throws(() => { authMiddleware(req, {}, () => { }) })
    //expect(authMiddleware.bind(this, req, {}, () => { })).to.throw();
  });
});
