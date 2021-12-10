const getUserByEmail = function(email, database) {
  let user;
  for (let userId in database) {
    if (database[userId]["email"] === email) {
      user = database[userId]
    }
  }
  return user;
};




module.exports = getUserByEmail