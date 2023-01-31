const bcrypt = require("bcryptjs");
// checks if email belongs in user database i.e is a valid email
// returns the email if email is valid
// other wise returns undefined
function getUserEmail(email, db){
  for (const key in db){
    if (db[key]["email"] === email) {
        return email;
    }
  }
  return undefined;

}
// takes email and user database as function args
// returns user-id of associated with email
// or undefined in the case of a invalid email
function getUserByEmail(email,db){

  for (const key in db){
    if (db[key]["email"] === email) {
      return key;
    }
  }
  return undefined;
}
// takes in a user-id as an agrument 
// returns an object populated with all urls belonging to that particular user
function urlsForUser(id, db) {
  const userURLs = {};
  for ( const key in db){
    if (db[key]["userID"] === id){
      userURLs[key] = db[key]["longURL"];
    }
    
  }
  return userURLs;

}
// email and password as function args
// returns true if entered password is associated with input email
// otherwise returns false
function verifyPassword(email, password, db){
  for (const key in db){
    if (db[key]["email"] === email) {
        if (bcrypt.compareSync(password, db[key]["password"])){
          return true;
        }
    }
  }
  return false;

}

//function that generates random 6 letter alphanumeric strings
//for user_id url database and short urls
function generateRandomString() {
  const chars = 'ABCEDEFGHIGKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < 6; i++){
    result += chars.charAt(Math.floor(Math.random()* charsLength));
  }
  return result; 
}
module.exports = {getUserEmail, getUserByEmail, urlsForUser, verifyPassword, generateRandomString};