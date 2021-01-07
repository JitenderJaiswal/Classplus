const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
// Login Functionality
const assert = require("assert");
const app = express();
const User = require("./models/user");
const port = 8000;

/* *
 * Requirements:
 *
 * If a user enters three wrong passwords consecutively 3 times, then BLOCK the USER. Reset in 1 hour
 * If a user enters three wrong passwords within a sliding  time frame of 30 mins, BLOCK the USER.
 *
 * */

const SLIDING_WINDOW_MINS = 30;

class LoginResponeEnum {
  static get SUCCESS() {
    return "SUCCESS";
  }

  static get FAIL() {
    return "FAIL";
  }

  static get BLOCKED() {
    return "BLOCKED";
  }

  static get values() {
    return [this.SUCCESS, this.FAIL, this.BLOCKED];
  }
}

class LoginSimulation {
  constructor() {
    // init some stuff
    this.initDB();
    this.initViewEngine();
    this.initExpressMiddleware();
    this.bootstrapUsers();
    this.count = 0;
    this.prevminute = 0;
    this.currminute = 0;
    this.fail = [];
  }
  initDB() {
    mongoose.connect("mongodb://localhost/UserDatabase", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "Error connecting to MongoDB"));
    db.once("open", function () {
      console.log("Connected to Database :: MongoDB");
    });
  }
  initViewEngine() {
    // set up the view engine
    app.set("view engine", "ejs");
    app.set("views", "./views");
  }
  initExpressMiddleware() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(
      session({
        secret: "User",
        saveUninitialized: true,
        resave: true,
        cookie: {
          maxAge: 1000 * 60 * 100,
        },
      })
    );
    app.use(flash());
    app.use(function (req, res, next) {
      res.locals.flash = {
        success: req.flash("success"),
        error: req.flash("error"),
      };
      next();
    });
  }
  bootstrapUsers() {
    // TODO
    //SignUp
    app.get("/signUp", (req, res) => {
      return res.render("createuser", { title: "Codeial | Sign Up" });
    });
    // create some users in the in memory database simulation
    app.post("/create", async (req, res) => {
      try {
        if (req.body.password != req.body.confirm_password) {
          req.flash("error", "Password not match");
          return res.redirect("back");
        }
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
          await User.create(req.body);
          req.flash("success", "User created sucessfully");
          return res.redirect("back");
        } else {
          req.flash("error", "User already in database");
          return res.redirect("back");
        }
      } catch (err) {
        console.log("Error", err);
        return;
      }
    });
  }
  doLogin1(username, password, date = new Date()) {
    this.currminute = (date - new Date()) / (1000 * 60);
    if (
      password === "wrong pass" ||
      (this.count >= 3 && this.currminute - this.prevminute <= 60)
    ) {
      if (this.count >= 3 && this.currminute - this.prevminute > 60) {
        this.count = 0;
      } else if (this.count >= 2) {
        this.count++;
        this.prevminute = this.currminute;
        return LoginResponeEnum.BLOCKED;
      } else {
        this.count++;
      }
      return LoginResponeEnum.FAIL;
    }
    return LoginResponeEnum.SUCCESS; // return a state
  }
  doLogin2(username, password, date = new Date()) {
    // TODO
    this.currminute = (date - new Date()) / (1000 * 60);
    if (
      password === "wrong pass" ||
      (this.fail.length >= 3 &&
        this.currminute - this.fail[0] <= SLIDING_WINDOW_MINS)
    ) {
      if (password === "wrong pass") this.fail.push(this.currminute);
      if (this.fail.length >= 3) {
        if (this.currminute - this.fail[0] <= SLIDING_WINDOW_MINS)
          return LoginResponeEnum.BLOCKED;
        else this.fail.shift();
      } else if (
        this.fail.length >= 1 &&
        this.currminute - this.fail[0] > SLIDING_WINDOW_MINS
      ) {
        this.fail.shift();
      }
      return LoginResponeEnum.FAIL;
    }
    return LoginResponeEnum.SUCCESS; // return a state
  }

  inMins(mins) {
    return new Date(+new Date() + mins * 60 * 1000);
  }

  // for testing
  testThreeConsiquitiveFailures() {
    console.log("Testing Three Consequitive wrong passwords");
    assert.equal(this.doLogin1("user 1", "wrong pass"), LoginResponeEnum.FAIL);
    assert.equal(
      this.doLogin1("user 1", "wrong pass", this.inMins(20)),
      LoginResponeEnum.FAIL
    );
    assert.equal(
      this.doLogin1("user 1", "wrong pass", this.inMins(25)),
      LoginResponeEnum.BLOCKED
    );
    assert.equal(
      this.doLogin1("user 1", "wrong pass", this.inMins(40)),
      LoginResponeEnum.BLOCKED
    );
    assert.equal(
      this.doLogin1("user 1", "wrong pass", this.inMins(60)),
      LoginResponeEnum.BLOCKED
    );
    assert.equal(
      this.doLogin1("user 1", "right pass", this.inMins(60)),
      LoginResponeEnum.BLOCKED
    );
    assert.equal(
      this.doLogin1("user 1", "wrong pass", this.inMins(150)),
      LoginResponeEnum.FAIL
    );
  }

  testUserIsBlockedInSlidingTimeFrame() {
    console.log("Testing user is blocked in sliding timeframe");
    assert.equal(this.doLogin2("user 1", "wrong pass"), LoginResponeEnum.FAIL);
    assert.equal(
      this.doLogin2("user 1", "right pass", this.inMins(5)),
      LoginResponeEnum.SUCCESS
    );
    assert.equal(
      this.doLogin2("user 1", "right pass", this.inMins(8)),
      LoginResponeEnum.SUCCESS
    );
    assert.equal(
      this.doLogin2("user 1", "wrong pass", this.inMins(20)),
      LoginResponeEnum.FAIL
    );
    assert.equal(
      this.doLogin2("user 1", "wrong pass", this.inMins(31)),
      LoginResponeEnum.FAIL
    );
    assert.equal(
      this.doLogin2("user 1", "right pass", this.inMins(40)),
      LoginResponeEnum.SUCCESS
    );
    assert.equal(
      this.doLogin2("user 1", "wrong pass", this.inMins(44)),
      LoginResponeEnum.BLOCKED
    );
    assert.equal(
      this.doLogin2("user 1", "right pass", this.inMins(45)),
      LoginResponeEnum.BLOCKED
    );
    assert.equal(
      this.doLogin2("user 1", "right pass", this.inMins(110)),
      LoginResponeEnum.SUCCESS
    );
  }
}

// Test condition 1
new LoginSimulation().testThreeConsiquitiveFailures();
// test condition 2
new LoginSimulation().testUserIsBlockedInSlidingTimeFrame();
app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log(`Server is running on port: ${port}`);
});
