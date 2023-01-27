const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080


function generateRandomString() {
  const chars = 'ABCEDEFGHIGKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < 6; i++){
    result += chars.charAt(Math.floor(Math.random()* charsLength));
  }
  return result; 
  
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]}
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
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
  res.cookie('username',req.body.username);
  res.redirect('/urls');

});

app.post("/logout", (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});