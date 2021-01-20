const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

// generate a random string for short Url
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let username = req.cookies.username
  const templateVars = { urls: urlDatabase, username: username };
  
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  let username = req.cookies.username

  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, username: username };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`) 
});

//Edits shortURL and redirects
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  
  res.redirect("/urls");
})

//deletes desired shortURL and redirects
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

//redirects user to the long Url associated to the short Url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL 
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});


//login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.Username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});