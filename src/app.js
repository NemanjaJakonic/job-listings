const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");

require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "keyboard cat",
  })
);
app.use(cookieParser());

app.use(flash());

app.use(methodOverride("_method"));

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layouts",
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

const expressHbs = hbs.create({});

expressHbs.handlebars.registerHelper('selected', function(selected, options) {
  return options.fn(this).replace(
      new RegExp(' value=\"' + selected + '\"'),
      '$& selected="selected"');
});

expressHbs.handlebars.registerHelper('checked', function(checked, options) {
  return options.fn(this).replace(
      new RegExp(' value=\"' + checked + '\"'),
      '$& checked="checked"');
});


app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "assets")));
app.use("/", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;