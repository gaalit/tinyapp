
let emailFinder = function(email, userDatabase) {
  for(let user in userDatabase) {
    if(email === userDatabase[user].email) {
      return userDatabase[user].id;
    }
    }
    return false;
  }

  let passwordMatching = function(password, userDatabase) {
    for(let user in userDatabase) {
      if(password === userDatabase[user].password) {
        return true
      }
      }
      return false;
    }
  

module.exports = {emailFinder, passwordMatching};