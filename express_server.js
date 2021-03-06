const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateRandomString, getUserByEmail, passwordMatching, urlsForUser, urlBelongToUser  } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['topsecret'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.set("view engine", "ejs");


// URL database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "Jerry"},
  "9sm5xK": {longURL:"http://www.google.com", userId: "Cosmo"}
};

// User database
const users = {};

// Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Adding new URL to database
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[user_id]};
  res.render("urls_new",templateVars);
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  const templateVars = { urls: urlsForUser(user_id, urlDatabase), user: users[user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let user_id = req.session.user_id;

  if (!user_id) {
    res.redirect("/login");
  } else if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
  const templateVars = { shortURL, longURL, user: users[user_id] };
  res.render("urls_show", templateVars);
  } else {
    res.status(401);
    res.send("Not authorized to view this page, status: 401");
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userId: req.session.user_id};
  res.redirect(`urls/${shortURL}`);
});

//Edits desired URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  let user_id = req.session.user_id;
  
  if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Deletes desired URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Redirects user to the actual website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//LOGIN
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let foundUser = getUserByEmail(req.body.email, users);

  if (foundUser) {
    if (passwordMatching(req.body.password,users[foundUser])) {
      req.session['user_id'] = foundUser;
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("Wrong password, status: 403");
    }
  } else {
    res.status(403);
    res.send("Email not found, status: 403");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// REGISTER
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (id === "" || email === "") {
    res.status(400);
    res.send("Empty field: status 400");
  }
  if (getUserByEmail(email, users)) {
    res.status(404);
    res.send("Email already exists: status 404");

  } else {
    const salt = bcrypt.genSaltSync(saltRounds);
    const newUser = {id, email, password: bcrypt.hashSync(password, salt)};
    users[id] = newUser;
    req.session['user_id'] = id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
