const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const getUserByEmail = require("./helperFunction")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require ('cookie-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

//Set the view engine to ejs
app.set("view engine", 'ejs');

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  
};

// This function will push all the URLS that match a user has into the array userUrls
const userUrlFilter = function (id){
  let userUrls = []
  for (const url in urlDatabase) {
    if (urlDatabase[url].user_id === id){
      userUrls.push(urlDatabase[url])
    }
  }
  return userUrls
}

const userDatabase = {
  "test": {
    id: "test",
    name: "John",
    email: "123@test.com",
    password: "$2a$10$AIlaC.1mpNABYX/DS85G.OdVVwlnCW3.7kr4xdiH3Zq6vwJMNxOdq"
  },
  "user2RandomID": {
    id: "user2RandomID",
    name: "Jack",
    email: "user2@example.com",
    password: "$2a$10$TKbt2GpLQNoSlp.xFDZnmOq6Pu5MParpTdbWG5nwEx.rExIl/qFMO"
  }
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/home", (req, res) => {
  const user_id = req.session["user_id"]
  const user = userDatabase[user_id]
  const templateVars = { urls: urlDatabase, user: user, userId: user_id };
  res.render ("home", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  
  
  
  const user_id = req.session["user_id"]
  const userUrlList = userUrlFilter(user_id)
  const user = userDatabase[user_id]
  
  
  
  
  
  console.log(user)
  const templateVars = { urls: userUrlList, user: user, userId: user_id }; // Can remove userId. This is a security concern. You do not want your user to know their own UserId.
  if (user_id){
    res.render("urls_index", templateVars);
  }
  else {
    res.redirect("/home")
  }
});

app.get("/urls/new", (req, res) => {

  const user_id = req.session["user_id"]
  const user = userDatabase[user_id]
  console.log(user)
  const templateVars = { user: user, userId: user_id };
  
  if (user_id){
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/home")
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  // const user_id = req.session["user_id"]
  // const user = userDatabase[user_id]
  // const shorturl_name = req.params.shortURL
  // console.log(user)



  const { user_id } = req.session  
  if (!user_id){
    return res.status(400).send("400 - You need to log in to access this page")
  }

  const user = userDatabase[user_id]
  if(!user){
    return res.status(400).send("400 - Not valid user")
  }

  const {shortURL} = req.params   // = 58c9ex 
  const urlObject = urlDatabase[shortURL]
  if (!urlObject){
    return res.status(400).send("400 - Sorry, there is no URL object")
  }

  const urlBelongsToUser = urlObject.user_id === user.id 
  if (!urlBelongsToUser){
    return res.status(400).send("400 - You do not own this URL")
  }

  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlObject.longURL, 
    user: user 
  };
  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const user_id = req.session["user_id"]
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = Math.random().toString(36).substr(2, 6)

  const {longURL} = req.body;
  if (!longURL){
    return res.status(400).send("400 - Sorry, there is no longURL")
  }

  urlDatabase[shortURL] = {
    longURL: longURL, 
    shortURL: shortURL,
    user_id: user_id
  };
  console.log("url Database", urlDatabase)
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});


app.post("/urls/:shortURL/edit", (req, res) => {
  
  const { user_id } = req.session 
  if (!user_id){
    return res.status(400).send("400 - You need to log in to access this page")
  }

  const user = userDatabase[user_id]
  if(!user){
    return res.status(400).send("400 - Not valid user")
  }

  const {shortURL} = req.params
  const urlObject = urlDatabase[shortURL]
  if (! urlObject ){
    return res.status(400).send("400 - There is no URL object with this ID")
  }

  const urlBelongsToUser = urlObject.user_id === user.id 
  if (!urlBelongsToUser){
    return res.status(400).send("400 - You do not own this URL")
  }

  const {longURL} = req.body
  if (!longURL){
    return res.status(400).send("400 - You need to pass a longURL")
  }

  urlObject.longURL = longURL   
  res.redirect("/urls")

  // urlDatabase[req.params.shortURL].longURL = req.body["longURL"]
  // console.log(urlDatabase)
});


// app.post("/urls/:shortURL/edit", (req, res) => {
//   const user_id = req.session["user_id"]
//   if (user_id === urlDatabase[req.params.shortURL][user_id]) {
//     urlDatabase[req.params.shortURL].longURL = req.body["longURL"]
//     console.log(urlDatabase)
//     res.redirect("/urls")
//   }
//   else {
//     return res.status(403).send("403 - Sorry, user already exists!")
//   }
// });




app.post("/login", (req, res) => {


  // extract the login info from the incoming form using req.body
  const email = req.body.email;
  const password = req.body.password;
  console.log(bcrypt.hashSync(password, 10))


  //Verification

  
  const user = getUserByEmail(email, userDatabase) // This is a helper function from the helperFunction.js

  // for (let userId in userDatabase) {
  //   if (userDatabase[userId]["email"] === email) {
  //     user = userDatabase[userId]
  //   }
  // }
  // console.log(user.password)
  // console.log(email)
  // console.log(typeof password)
  // console.log(password)

  if (!user) {
    return res.status(403).send("403 - Email is not found")
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("403 - Password is incorrect")
  } else if (bcrypt.compareSync(password, user.password)) {
    // Login is successful
    // set the cookie. The cookie will keep the userId.
    req.session["user_id"] = user["id"]
    return res.redirect("/urls")
  } else {
    return res.status(403).send("403 - Something went wrong")
  }

})

app.post("/logout", (req, res) => {
  res.clearCookie("session")
  res.redirect("/login")
})

// Authentication Routes

app.get("/register", (req, res) => {


  const user_id = req.session["user_id"]
  const user = userDatabase[user_id]
  console.log(user)
  const templateVars = { user: user, userId: user_id };

  // render the register form
  res.render("register", templateVars)
})


//temporary route to show the users
app.get("/users.json", (req, res) => {
  res.json(userDatabase);

})

//receive the info from the register form
app.post("/register", (req, res) => {

  // extract the user info from the incoming form using req.body
  
  // const email = req.body.email;
  // const password = req.body.password;
  // const name = req.body.name;
  const {email, password, name} = req.body // Exactly the same as the previous three lines. This is called destructuring an object.

  


  //validation. We need to ensure that the new user is not already in the database. Since userID is not created yet, we /
  //have to use email for this step.
  //Verify if a user with that email exists in the db. If yes, send back an error message. If no, continue with the registration.

  for (let userId in userDatabase) {
    const user = userDatabase[userId] // retrieve the value
    // if (!email || !password || !name) {
    //   return res.status(403).send("403 - All fields cannot be empty")
    // }  No longer required since we added required to all the form inputs.


    if (user.email === email) {
      return res.status(403).send("403 - Sorry, user already exists!")

    }
  }


  //create a new user id
  const userId = Math.random().toString(36).substr(2, 8)

  // add name, email, password to our users db to create a new user
  const newUser = {
    id: userId,
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10)
  }

  //add the new user to the db
  userDatabase[userId] = newUser

  // set the cookie. The cookie will keep the userId.
  //res.cookie("user_id", userId);
  req.session["user_id"] = userId

  res.redirect('/urls');
  console.log(userDatabase);
})

//
app.get("/login", (req, res) => {
  //render the register form

  const user_id = req.session["user_id"]
  const user = userDatabase[user_id]
  //console.log(user)
  const templateVars = { user: user, userId: user_id };

  // render the login form
  res.render("login", templateVars)
})




app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

