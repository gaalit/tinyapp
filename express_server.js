const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const { emailFinder } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

// generate a random string for short Url and userId
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User database
const users = { 
  "userRandomID": {
    id: "Jerry", 
    email: "jerry@geemail.com", 
    password: "jerry1"
  },
 "userRandomID1": {
    id: "Cosmo", 
    email: "cosmo@geemail.com", 
    password: "cosmo1"
  }
}

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
  let user_id = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user: users[user_id] };
  res.render("urls_new",templateVars);
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user: users[user_id] };
  
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  let user_id = req.cookies.user_id

  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, user: users[user_id] };
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
  res.cookie('user_id', req.body.user_id)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});

// register
app.get("/register", (req, res) => {
  res.render("urls_register");
})


app.post("/register", (req, res) => {
const id = generateRandomString();
const email = req.body.email;
const password = req.body.password;

if(id === "" || email === "") {
 console.log("Hello");
  res.status(400)
  res.send("Empty field: status 400")
}

console.log(emailFinder(email, users))
if(emailFinder(email, users)) {
  console.log("hell0;")
  res.status(404);
  res.send("Email already exists: status 404")
} else {
  const newUser = {id, email, password};
  users[id] = newUser;
  res.cookie('user_id', id)
  res.redirect("/urls");
}
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
