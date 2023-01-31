const { assert } = require('chai');
const bcrypt = require('bcryptjs');


const { getUserByEmail, getUserEmail, urlsForUser, verifyPassword, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk",10)
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
});

describe('getUserEmail', function() {

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


});

describe('urlsForUsers', function() {
  it('should return an object populated with all urls belonging to specfic user', function() {
    const userURLs = urlsForUser("userRandomID", testUrls);
    const expectedURLs = {"i3BoGr" : "https://www.google.ca", "g4bTXn" : "https://www.reddit.com"};
    assert.deepEqual(userURLs,expectedURLs);
  });

  it('should return an empty object when passed a user id with no associated urls', function() {
    const userURLs = urlsForUser("user2RandomID", testUrls);
    // const expectedURLs = {"i3BoGr" : "https://www.google.ca", "g4bTXn" : "https://www.reddit.com"};
    assert.deepEqual(userURLs,{});
  });

});

describe('verifyPassword', function() {
  it('should return true when given a valid password that belongs to user', function() {
    assert.isTrue(verifyPassword("user2@example.com", "dishwasher-funk", testUsers));
  });

  it('should return false when passed a valid password that doesn\'t belong with email', function() {
   assert.isFalse(verifyPassword("user2@example.com", "purple-monkey-dinosaur",testUsers));
  });

  it('should return false when passed a invalid password that doesn\'t belong with email', function() {
    assert.isFalse(verifyPassword("user2@example.com", "mickey-mouse",testUsers));
   });

});

describe('generatePassword', function() {
  it('should return an alphanumeric string of exactly 6 characters and numbers' , function () {
  assert.equal(generateRandomString().length, 6); 
});
});