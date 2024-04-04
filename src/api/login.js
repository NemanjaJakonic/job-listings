const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../db");

const schema = Joi.object({
  email: Joi.string().trim().required().email(),
  password: Joi.string().trim().required(),
});

connectDB()
  .then(({ jobs, users }) => {
    // READ ALL
    router.get("/", async (req, res, next) => {
      try {
        const items = await users.find({});
        const token = req.cookies.jwt;

        if (token) {
          res.redirect("/admin");
        } else {
          res.render("login", {
            items,
            messages: req.flash("successfull_register"),
            invalid_password: req.flash("invalid_password"),
            invalid_email: req.flash("invalid_email"),
          });
        }
      } catch (error) {
        next(error);
      }
    });

    // CREATE ONE
    router.post("/", async (req, res, next) => {
      try {
        const user = await users.findOne({
          email: req.body.email,
        });
        if (!user) {
          req.flash("invalid_email", "Email doesnt exist!");
          res.redirect("/login");
        }

        const validPass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!validPass) {
          req.flash("invalid_password", "Invalid password!");
          res.redirect("/login");
        }

        const value = await schema.validateAsync({
          email: req.body.email,
          password: req.body.password,
        });

        const token = jwt.sign(
          {
            _id: user._id,
          },
          process.env.TOKEN_SECRET
        );
        console.log(token);
        // res.header("auth-token", token).send(token);
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 3600000,
        });
        res.redirect("/admin");
      } catch (error) {
        next(error);
      }
    });
  })
  .catch(console.error);
// .finally(() => client.close());

// const users = db.get("users");

module.exports = router;
