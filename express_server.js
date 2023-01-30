const express = require("express");
const cookieParser = require('cookie-parser');
const { renderFile } = require("ejs");
const e = require("express");
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// function lookUpUser(user_id){
//   users[user_id]? users[user_id]: undefined;
// }

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
        if (users[key]["password"] === password){
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
  const user = users[req.cookies.user_id];
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

// display new short url on /urls/new page"
app.get("/urls/new", (req, res) => {
  // const templateVars = { username: req.cookies["username"]}
  const user = users[req.cookies.user_id]
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});
//display new long and short url on urls page
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id]= req.body.longURL;
  res.redirect(`/urls/${id}`);
});

//delete specfic url and redirect back to /urls page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//display clickable short url on /urls/id page
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]= req.body.longURL;
  res.redirect('/urls');
});

// redirect from /u/id to long url by clicking clickable short link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: undefined};
  res.render('urls_login',templateVars);

});
// handle login response
app.post("/login", (req,res) => {
  if(!getUserEmail(req.body.email)){
    res.sendStatus(403);
  }
  else if (!verifyPassword(req.body.email, req.body.password)){
    res.sendStatus(403);
  }
  else{
    const user_id = getUserId(req.body.email);
    res.cookie("user_id", user_id);
    console.log(req.cookies.user_id);
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: undefined};
  res.render("urls_register", templateVars);
})
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
    users[user_id] = {id : user_id, email: req.body.email, password: req.body.password};
    console.log("USER_ID",users[user_id]);
    res.cookie("user_id", user_id);
    console.log(users);
    res.redirect('/login');
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});