const express = require("express");

const jobs = require("./jobs");

const login = require("./login");

const register = require("./register.js");

const admin = require("./admin.js");


const router = express.Router();

// router.get("/", (req, res) => {
//   res.render("home");
// });

router.get("/logout", (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/')
});

router.use("/", jobs);

router.use("/login", login);

router.use("/register", register);

router.use("/admin", admin);

module.exports = router;