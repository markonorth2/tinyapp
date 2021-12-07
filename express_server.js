const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



//Set the view engine to ejs
app.set("view engine", 'ejs');

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shorturl_name = req.params.shortURL
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shorturl_name]};
  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  const longURL =  urlDatabase[req.params.shortURL]
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
  urlDatabase[req.params.shortURL]= req.body["longURL"]
  console.log(urlDatabase)
  res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

