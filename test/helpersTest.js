const { assert } = require('chai');
//const { getUserByEmail } = require('./helperFunction');
const getUserByEmail = require("../helperFunction")
const testUsers = {

  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers)
    const expectedUserID = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur'
    };
    assert.deepEqual(user, expectedUserID);
  });
  it('should return undefined if the email is not in the database', function() {
    const user = getUserByEmail('bob@bob.com', testUsers)
    const expectedUserID = undefined;
    assert.isUndefined(user, expectedUserID);
  });
});