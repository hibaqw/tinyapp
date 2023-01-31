const express = require("express");
const cookieParser = require('cookie-parser');
const { renderFile } = require("ejs");
const e = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

//database of users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
//database of urls 
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};
//function that generates random 6 letter alphanumeric strings
//for user_id url database
function generateRandomString() {
  const chars = 'ABCEDEFGHIGKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < 6; i++){
    result += chars.charAt(Math.floor(Math.random()* charsLength));
  }
  return result; 
}

//Helper Functions

function urlsForUser(id) {
  const userURLs = {};
  for ( const key in urlDatabase){
    if (urlDatabase[key]["userID"] === id){
      userURLs[key] = urlDatabase[key]["longURL"];
    }
    
  }
  return userURLs;

}

function getUserEmail(email){

  for (const key in users){
    // console.log(`email: ${users[key]["email"]}`, email === users[key][email]);
    // console.log('input email: ', users[key][email]);
    if (users[key]["email"] === email) {
        return email;
    }
  }
  return undefined;

}
function verifyPassword(email, password){
  for (const key in users){
    if (users[key]["email"] === email) {
        if (bcrypt.compareSync(password, users[key]["password"])){
          return true;
        }
    }
  }
  return false;

}

function getUserId(email){

  for (const key in users){
    if (users[key]["email"] === email) {
      return key;
    }
  }
}


//middleware
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// display short and long urls on /urls page
app.get("/urls", (req, res) => {

  if(!req.cookies.user_id){
    res.send("Login or Sign Up to Create and View URLs.");
    return;
  }
  const id = req.cookies.user_id;
  const user = users[id];
  const urls = urlsForUser(id)
  const templateVars = { urls, user: user};
  res.render("urls_index", templateVars);
});

// display new short url on /urls/new page"
app.get("/urls/new", (req, res) => {
  // const templateVars = { username: req.cookies["username"]}
  if (!req.cookies.user_id){
    res.redirect('/login');
  }
  else {
    const user = users[req.cookies.user_id]
    const templateVars = {user: user};
    res.render("urls_new", templateVars);
  }
});
//display new long and short url on urls page
app.post("/urls", (req, res) => {
  if(!req.cookies.user_id){
    res.send("Login or Sign Up to Create New URL Link");
    return;
  }
  else {
    let id = generateRandomString();
    urlDatabase[id].longURL= req.body.longURL;
    res.redirect(`/urls/${id}`);
  }
  return;

});

//delete specfic url and redirect back to /urls page
app.post("/urls/:id/delete", (req, res) => {
  if(!req.cookies.user_id){
    res.send("Login or Sign Up to Delete URL Link");
    return;
  }
  //Check if ID is in Database
  if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }

   //Check if ID Belongs To User
   const user_id = req.cookies.user_id;
   const browser_id = req.params.id;
   const urlObj = urlsForUser(user_id);
   for (const key in urlObj){
     if (key === browser_id){
      delete urlDatabase[req.params.id];
      res.redirect('/urls');
       return;
     }
   }
   res.send('Request to Delete URL Denied. Only URLs Associated with User Account Can be Deleted.');
   return;
});
//display clickable short url on /urls/id page
app.get("/urls/:id", (req, res) => {
  //Check if User is Logged In
  if(!req.cookies.user_id){
    res.send("Login or Sign Up to View URLs.");
    return;
  }
  //Check if ID is in Database
  if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }
  //Check if ID Belongs To User
  const user_id = req.cookies.user_id;
  const browser_id = req.params.id;
  const urlObj = urlsForUser(user_id);
  for (const key in urlObj){
    if (key === browser_id){
      const user = users[req.cookies.user_id];
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, urls: urlDatabase ,user: user};
      res.render("urls_show", templateVars);
      return;
    }
  }
  res.send('Entered URL Not Associated With Account. Only URLs Associated with User Account Can be Edited.');
  return;
  
});

//post request to edit existing longURL
app.post("/urls/:id", (req, res) => {

  if(!req.cookies.user_id){
    res.send("Login to Update Existing Url.");
    return;
  }
   //Check if ID is in Database
   if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }
  //Check if ID Belongs To User
  const user_id = req.cookies.user_id;
  const browser_id = req.params.id;
  const urlObj = urlsForUser(user_id);
  for (const key in urlObj){
    if (key === browser_id){
      const user = users[req.cookies.user_id];
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, urls: urlDatabase ,user: user};
      res.render("urls_show", templateVars);
      return;
    }
  }
  res.send('Request to Edit URL Denied. Please Create Or Enter Existing URL.');
  return;

  urlDatabase[req.params.id].longURL= req.body.longURL;
  res.redirect('/urls');
});

// redirect from /u/id to long url by clicking clickable short link
app.get("/u/:id", (req, res) => {

  const longURL = urlDatabase[req.params.id].longURL;
  // is this a good way for checking if id exists in database
  // what about the message sent?
  /*if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }*/

//if longURL doesn't exist
//send status 404 response
  if(!longURL){
    res.sendStatus(404);
  }
  //else redirect to longURL
  else{
    res.redirect(longURL);
  }
});
// get login info and render login page
app.get("/login", (req,res) => {
  if(!req.cookies.user_id){
    console.log(req.param.id);
    const templateVars = { id: req.params.id,user: undefined};
    res.render('urls_login',templateVars);
  }
  else{
    res.redirect('/urls');
  }

});
// handle login response
app.post("/login", (req,res) => {
  if(!getUserEmail(req.body.email)){
    res.sendStatus(403);
    return;
  }
  if (!verifyPassword(req.body.email, req.body.password)){
    res.sendStatus(403);
    return;
  }
  else{
    const user_id = getUserId(req.body.email);
    res.cookie("user_id", user_id);
    res.redirect('/urls');
  }

});
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// render login page
app.get("/register", (req,res) =>{
  //const user = users["userRandomID"];
  if (!req.cookies.user_id) {
    const templateVars = { id: req.params.id, user: undefined};
    res.render("urls_register", templateVars);
  }
  else {
    res.redirect('/urls');
  }

});
// handle login response
app.post("/register", (req,res) =>{
  // const user_email = req.body.email;
  // const user_pass = req.body.password;
  if(req.body.email === "" || req.body.password === "" || getUserEmail(req.body.email)){
    console.log(getUserEmail(req.body.email));
    res.sendStatus(404);
  }
  else{
    const user_id  = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[user_id] = { user_id, email, password: hashedPassword};
    console.log("USER_ID",users[user_id]);
    res.cookie("user_id", user_id);
    console.log(users);
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});