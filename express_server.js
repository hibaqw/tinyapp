const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080


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
function generateRandomString() {
  const chars = 'ABCEDEFGHIGKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < 6; i++){
    result += chars.charAt(Math.floor(Math.random()* charsLength));
  }
  return result; 
  
}

function lookUpUser(user_id){
  users[user_id]? users[user_id]: undefined;
}
app.set("view engine", "ejs");
app.use(cookieParser())
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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

app.get("/urls", (req, res) => {
  const user = lookUpUser(req.cookies["user_id"]);
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  // const templateVars = { username: req.cookies["username"]}
  const user = lookUpUser(req.cookies["user_id"]);
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id]= req.body.longURL;
  res.redirect(`/urls/${id}`);
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.get("/urls/:id", (req, res) => {
  const user = lookUpUser(req.cookies["user_id"]);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]= req.body.longURL;
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if(!longURL){
    res.render("urls_error");
  }
  else{
    res.redirect(longURL);
  }
});

app.post("/login", (req,res) => {
  // res.cookie('user_id',lookUpUser(req.cookie["user_id"]));
  res.redirect('/urls');

});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
app.get("/register", (req,res) =>{
  //const user = users["userRandomID"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: undefined};
  res.render("urls_register", templateVars);
})
app.post("/register", (req,res) =>{
  const user_id  = generateRandomString();
  users[user_id] = {id : user_id, email: req.body.email, password: req.body.password};
  console.log("USER_ID",users[user_id]);
  res.cookie("user_id", user_id);
  console.log(users);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});