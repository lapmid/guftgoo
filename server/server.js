const path = require("path");
const http = require("http");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const authRoutes = require("./auth/auth");
const transferRoutes = require("./transfer/transfer");
const setupSocketIO = require("./socket");

require("dotenv").config();
require("./auth/db");
require("./auth/passport-config");

const publicPath = path.join(__dirname, "./public");
const port = process.env.PORT || 8080;
var cors = require("cors");

var app = express();
var server = http.createServer(app);
setupSocketIO(server);

// Middleware
app.use(cors({ origins: "*" }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.json({limit: '50mb'}));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static(publicPath));
app.use(passport.initialize());
app.use(passport.session());

// Routes

app.use("/auth", authRoutes);
app.use("/transfer", transferRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});
server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
