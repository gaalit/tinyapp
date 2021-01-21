const bcrypt = require("bcrypt");

//emailFinder
let getUserByEmail = function(email, userDatabase) {
  for(let user in userDatabase) {
    if(email === userDatabase[user].email) {
      return userDatabase[user].id;
    }
    }
  }

  let passwordMatching = function(password, user) {  
      if(bcrypt.compareSync(password, user.password)) {
        return true
      }
      return false;
    }
  
//returns a seperate object with all of the short url's associated to a specific user
    const urlsForUser = function(id, urlDatabase) {
      const urltoDisplay = {};
       for(let shortURL in urlDatabase) {      
        if(urlDatabase[shortURL].userId === id) {
          urltoDisplay[shortURL] = urlDatabase[shortURL];
        }
      }
      return urltoDisplay;
    }

    const urlBelongToUser = function(id, shortURL, urlDatabase) {
      if(urlDatabase[shortURL].userId === id) {
        return true;
     }
     return false;
    }

module.exports = { getUserByEmail, passwordMatching, urlsForUser, urlBelongToUser };