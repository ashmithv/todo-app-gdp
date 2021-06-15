require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");

const User = require("./models/user");
const Todo = require("./models/todo");

app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//SESSION
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

//EJS
app.set("view-engine", "ejs");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log(error));

//Signup GET
app.get("/", (req, res) => {
  res.render("signup.ejs");
});

//Signup POST
app.post("/signup", async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    await user.save();
    console.log("User is Created");
    res.redirect("/login");
  } catch (error) {
    res.redirect("/");
  }
});

//Login GET
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

//Login POST
app.post("/signin", async (req, res) => {
  await User.find({ email: req.body.email })
    .then((data) => {
      if (req.body.password == data[0].password) {
        req.session.user = data[0];
        res.redirect("/dashboard");
      }
    })
    .catch((e) => {
      console.log(e);
      res.send("Error");
    });
});

//Dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs");
});

//ADD Todo
app.post("/addtodo", async (req, res) => {
  try {
    const todo = new Todo({
      userId: req.session.user._id,
      content: req.body.content,
    });
    await todo.save();
    console.log("Todo Added");
    res.send("Todo Added");
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port 3000");
});
