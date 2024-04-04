const express = require("express");
const { connectDB } = require("../db");
const { ObjectId } = require("mongodb");

//const jwt = require("jsonwebtoken");

const router = express.Router();

connectDB()
  .then(({ jobs, users }) => {
    // READ ALL
    router.get("/", async (req, res, next) => {
      try {
        const Jobs = await jobs
          .find(
            {},
            {
              sort: {
                date: -1,
              },
            }
          )
          .toArray();

        const LoggedIn = req.cookies.jwt;
        let days = Jobs.map((Jobs) =>
          Math.floor(
            Math.abs(new Date() - new Date(Jobs.date)) / (1000 * 60 * 60 * 24)
          )
        );
        let newJob = days.map((day) => day < 3);
        res.render("index", {
          Jobs,
          days,
          LoggedIn,
          newJob,
        });
      } catch (error) {
        next(error);
      }
    });

    // READ ONE
    router.get("/job/:id", async (req, res, next) => {
      try {
        const { id } = req.params;
        const LoggedIn = req.cookies.jwt;

        const item = await jobs.findOne({
          _id: new ObjectId(id),
        });
        if (!item) return next();
        res.render("job", {
          item,
          LoggedIn,
        });
        // return res.json(item);
      } catch (error) {
        next(error);
      }
    });

    router.get("/api", async (req, res, next) => {
      try {
        const items = await jobs.find({}).toArray();

        res.json(items);
      } catch (error) {
        next(error);
      }
    });
  })
  .catch(console.error);
// .finally(() => client.close());

// const monk = require("monk");
// const db = monk(process.env.MONGO_URI);

module.exports = router;
