// auth.js

const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const router = express.Router();
const User = require("./user");

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

// Log in user
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("login", user, err, info);
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    if (!user.verified) {
      return res.status(401).json({ message: "User is not verified" });
    }

    // User is verified, proceed with login
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Return success response or redirect to authenticated route
      const { username, level, verified } = user;
      return res
        .status(200)
        .json({
          user: { username, verified, level },
          message: "Login successful",
        });
    });
  })(req, res, next);
});

// Log out user
router.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logout successful" });
});

module.exports = router;
