const express = require("express");

const router = express.Router();

//const monk = require("monk");

const Joi = require("joi");

const bcrypt = require("bcryptjs");

// const db = monk(process.env.MONGO_URI);

// const users = db.get("users");

const { connectDB } = require("../db");

connectDB()
  .then(({ jobs, users }) => {
    // console.log(jobs);
    // console.log(users);
  })
  .catch(console.error);
// .finally(() => client.close());

const schema = Joi.object({
  firstName: Joi.string().trim().alphanum().min(3).max(15).required(),
  lastName: Joi.string().trim().alphanum().min(3).max(15).required(),
  email: Joi.string().trim().required().email().max(30),
  password: Joi.string().trim().required().min(5).max(20),
});

// READ ALL
router.get("/", async (req, res, next) => {
  try {
    const items = await users.find({});
    const token = req.cookies.jwt;
    if (token) {
      res.redirect("/admin");
    } else {
      res.render("register", {
        items,
        bademail: req.flash("existing_email"),
        badpassword: req.flash("mismatch_passwords"),
        message: req.flash("error"),
      });
    }
  } catch (error) {
    next(error);
  }
});

// CREATE ONE
router.post("/", async (req, res, next) => {
  try {
    const emailExists = await users.findOne({
      email: req.body.email,
    });
    if (emailExists) {
      req.flash("existing_email", "Email already exists!");
      res.redirect("/register");
    }

    if (req.body.password !== req.body.confirmPassword) {
      req.flash("mismatch_passwords", "Passwords dont match!");
      res.redirect("/register");
    }

    await schema.validateAsync({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    });

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const value = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPassword,
    };

    const inserted = await users.insert(value);
    if (inserted) {
      req.flash("successfull_register", "Successfully registered!");
      res.redirect("/login");
    }
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
    next();
  }
});

module.exports = router;
