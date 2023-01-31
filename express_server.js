const express = require("express");
const {getUserEmail, getUserByEmail, urlsForUser, verifyPassword, generateRandomString} = require('./helpers');
const cookieSession = require('cookie-session');
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
    password: "purple-monkey-dinosaur"
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

//middleware
app.set("view engine", "ejs");
app.use(cookieSession({
  name:"tinyApp",
  keys: ["1uuiwl7y2lq4wb073fjxa7x3zfivd8d5cyt","hfuq9rq6x2zyz0xx9hlcsg2qwzpxr09wonp"]
}));
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

  // if user is not logged in print out error message
  if(!req.session.user_id){
    res.send("Login or Sign Up to Create and View URLs.");
    return;
  }
  /**
   * 1. get user_id cookie
   * 2. get object associated with id
   * 3. pass it to urlsforuser function which returns
   * a object populated with all urls associated with user
   * to display on urls page
   */
  const id = req.session.user_id;
  const user = users[id];
  const urls = urlsForUser(id, urlDatabase)
  const templateVars = { urls, user: user};
  res.render("urls_index", templateVars);
});

// display new page to create new url
app.get("/urls/new", (req, res) => {
  // if user is not logged in redirect them to login page
  if (!req.session.user_id){
    res.redirect('/login');
  }
  //render page
  else {
    const user = users[req.session.user_id]
    const templateVars = {user: user};
    res.render("urls_new", templateVars);
  }
});
//post request to display newly created url
app.post("/urls", (req, res) => {
  // if not logged in send error message
  if(!req.session.user_id){
    res.send("Login or Sign Up to Create New URL Link");
    return;
  }
  // create new short url and add data to url database
  else {
    let id = generateRandomString();
    urlDatabase[id] = {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect(`/urls/${id}`);
  }
  return;

});

//delete specfic url and redirect back to /urls page
app.post("/urls/:id/delete", (req, res) => {
  // if not logged in print appropiate error message
  if(!req.session.user_id){
    res.send("Login or Sign Up to Delete URL Link");
    return;
  }
  //Check if ID is in Database
  if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }

   //Check if ID Belongs To User
   const user_id = req.session.user_id;
   const browser_id = req.params.id;
   const urlObj = urlsForUser(user_id, urlDatabase);
   // if short id in url object matches browser id 
   // delete the url
   for (const key in urlObj){
     if (key === browser_id){
      delete urlDatabase[browser_id];
      res.redirect('/urls');
       return;
     }
   }
   // print error message if user attempts to delete url that doesnt belong to them
   res.send('Request to Delete URL Denied. Only URLs Associated with User Account Can be Deleted.');
   return;
});
//display clickable short url on /urls/id page
app.get("/urls/:id", (req, res) => {
  //Check if User is Logged In
  if(!req.session.user_id){
    res.send("Login or Sign Up to View URLs.");
    return;
  }
  //Check if ID is in Database
  if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }
  //Check if ID Belongs To User
  const user_id = req.session.user_id;
  const browser_id = req.params.id;
  const urlObj = urlsForUser(user_id, urlDatabase);
  for (const key in urlObj){
    // if key matches browser_id render page
    if (key === browser_id){
      const user = users[user_id];
      const templateVars = { id: browser_id, longURL: urlDatabase[browser_id].longURL, urls: urlDatabase ,user: user};
      res.render("urls_show", templateVars);
      return;
    }
  }
  // print messsage if user attempts to access a short link not associated with their account
  res.send('Entered URL Not Associated With Account. Only URLs Associated with User Account Can be Edited.');
  return;
  
});

//post request to edit existing longURL
app.post("/urls/:id", (req, res) => {

  if(!req.session.user_id){
    res.send("Login to Update Existing Url.");
    return;
  }
   //Check if ID is in Database
   if (!urlDatabase[req.params.id]){
    res.send('Short URL Entered Does Not Exist.')
    return;
  }
  //Check if ID Belongs To User
  const user_id = req.session.user_id;
  const browser_id = req.params.id;
  const urlObj = urlsForUser(user_id, urlDatabase);
  for (const key in urlObj){
    if (key === browser_id){
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect('/urls');
      return;
    }
  }
  //print error message if there is an attempt to edit a url that doesnt belong to user
  res.send('Request to Edit URL Denied. Please Create Or Enter Existing URL.');
  return;

});

// redirect from /u/id to long url by clicking clickable short link
app.get("/u/:id", (req, res) => {

  const urlObj = urlDatabase[req.params.id];
//if longURL doesn't exist
//send status 404 response
  if(!urlObj){
    res.send('Page Not Found.');
  }
  //else redirect to longURL
  else{
    res.redirect(urlObj.longURL);
  }
});
// get login info and render login page
app.get("/login", (req,res) => {
  if(!req.session.user_id){
    const templateVars = { id: req.params.id,user: undefined};
    res.render('urls_login',templateVars);
  }
  // if user is logged in redirect to urls 
  else{
    res.redirect('/urls');
  }

});
// handle login response
app.post("/login", (req,res) => {
  // if user email doesnt exist
  // send error message
  if(!getUserEmail(req.body.email, users)){
    res.send('Wrong Email.')
    return;
  }
  // if user entered invalid password send error message
  if (!verifyPassword(req.body.email, req.body.password, users)){
    res.send('Wrong Password.')
    return;
  }
  else{
    //get user_id and set cookie
    const user_id = getUserByEmail(req.body.email,users);
    req.session.user_id= user_id;
    res.redirect('/urls');
  }

});
app.post("/logout", (req,res) => {
  // clear cookie
  req.session = null
  res.redirect('/login');
});

// render login page
app.get("/register", (req,res) =>{

  if (!req.session.user_id) {
    const templateVars = { id: req.params.id, user: undefined};
    res.render("urls_register", templateVars);
  }
  // redirect to urls page if user is logged in
  else {
    res.redirect('/urls');
  }

});
// handle login response
app.post("/register", (req,res) =>{

  // if user inputs empty strings or a taken email send forbidden message
  if(req.body.email === "" || req.body.password === "" || getUserEmail(req.body.email, users)){
    res.send('Invalid entry. Please enter valid credentials.');
  }
  else{
    // add user data into database
    // hash password
    // and load cookie
    const user_id  = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[user_id] = { user_id, email, password: hashedPassword};
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

