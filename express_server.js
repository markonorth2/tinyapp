const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())



//Set the view engine to ejs
app.set("view engine", 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "test": {
    id: "test",
    name: "John",
    email: "123@test.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    name: "John",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  console.log(user)
  const templateVars = { urls: urlDatabase, user: user, userId: user_id }; // Can remove userId. This is a security concern. You do not want your user to know their own UserId.

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  console.log(user)
  const templateVars = { user: user, userId: user_id };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  const shorturl_name = req.params.shortURL
  console.log(user)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shorturl_name], user: user, userId: user_id };
  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = Math.random().toString(36).substr(2, 6)

  urlDatabase[shortURL] = req.body["longURL"]
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});


app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body["longURL"]
  console.log(urlDatabase)
  res.redirect("/urls")
});

app.post("/login", (req, res) => {


  // extract the login info from the incoming form using req.body
  const email = req.body.email;
  const password = req.body.password;
  let user;


  //Verification

  for (let userId in userDatabase) {
    if (userDatabase[userId]["email"] === email) {
      user = userDatabase[userId]
    }
  }
  // console.log(user.password)
  // console.log(email)
  // console.log(typeof password)
  // console.log(password)

  if (!user) {
    return res.status(403).send("403 - Email is not found")
  } else if (user.password !== password) {
    return res.status(403).send("403 - Password is incorrect")
  } else if (user.password === password) {
    // Login is successful
    // set the cookie. The cookie will keep the userId.
    res.cookie("user_id", user["id"]);
    return res.redirect("/urls")
  } else {
    return res.status(403).send("403 - Something went wrong")
  }

})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login")
})

// Authentication Routes

app.get("/register", (req, res) => {


  const user_id = req.cookies["user_id"]
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
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  //validation. We need to ensure that the new user is not already in the database. Since userID is not created yet, we /
  //have to use email for this step.
  //Verify if a user with that email exists in the db. If yes, send back an error message. If no, continue with the registration.

  for (let userId in userDatabase) {
    const user = userDatabase[userId] // retrieve the value
    if (!email || !password || !name) {
      return res.status(403).send("403 - All fields cannot be empty")
    }


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
    password: password
  }

  //add the new user to the db
  userDatabase[userId] = newUser

  // set the cookie. The cookie will keep the userId.
  res.cookie("user_id", userId);

  res.redirect('/urls');
  console.log(userDatabase);
})

//
app.get("/login", (req, res) => {
  //render the register form

  const user_id = req.cookies["user_id"]
  const user = userDatabase[user_id]
  //console.log(user)
  const templateVars = { user: user, userId: user_id };

  // render the login form
  res.render("login", templateVars)
})




app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

