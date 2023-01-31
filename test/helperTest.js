const { assert } = require('chai');

const { getUserByEmail, getUserEmail, urlsForUser, verifyPassword, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrls = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },

  g4bTXn: {
    longURL: "https://www.reddit.com",
    userID: "userRandomID",
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user,expectedUserID);
  });
  it('should return a undefined when given an invalid email', function() {
    const user = getUserByEmail("user97@example.com", testUsers)
    // Write your assert statement here
    assert.isUndefined(user);
  });
  it('should return a undefined when given an empty string as an email', function() {
    const user = getUserByEmail("", testUsers)
    // Write your assert statement here
    assert.isUndefined(user);
  });
  it('should return a undefined when given an invalid email', function() {
    const user = getUserByEmail("user97@example.com", testUsers)
    // Write your assert statement here
    assert.isUndefined(user);
  });

  it('should return the same email when given an valid email i.e email exists in user database', function() {
    const user = getUserEmail("user@example.com", testUsers);
    const expectedEmail = "user@example.com";
    assert.equal(user, expectedEmail );
  });

  it('should return undefined when given an invalid email i.e email does not exist in user database', function() {
    const user = getUserEmail("user97@example.com", testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined when given an empty string as an argument', function() {
    const user = getUserEmail(" ", testUsers);
    assert.isUndefined(user);
  });

  it('should return an objected populated with ', function() {
    const user = getUserEmail(" ", testUsers);
    assert.isUndefined(user);
  });

  






});