
let emailFinder = function(email, userDatabase) {
  for(let user in userDatabase) {
    if(email === userDatabase[user].email) {
      return true
    } else {
      return false;
    }
  }
}



module.exports = {emailFinder};