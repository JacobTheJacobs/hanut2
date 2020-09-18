const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken"); //to generate signed token

const User = require("../models/user");
const { errorHandler } = require("../helpers/db_error_handler");

//@@Sign up
router.post(
  "/singup",
  [
    body("name", "Name is required").notEmpty(),
    // password must be at least 5 chars long
    body("email", "Email must be between 3 to 32 charecters")
      .isEmail()
      .isLength({
        min: 4,
        max: 32,
      }),
    body("password", "password is required").notEmpty(),
    body("password", "password is required")
      .isLength({ min: 6 })
      .withMessage("Pasword must conntain at least 6 digits")
      .matches(/\d/)
      .withMessage("Passwrod must contain a number"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors.errors);
    if (errors.errors.length > 0) {
      const firstError = errors.array().map((error) => error.msg)[0];
      return res.status(400).json({ errors: firstError });
    }
    const user = new User(req.body);
    console.log(user);
    user.save((err, user) => {
      if (err) {
        return res.status(400).json({
          err: errorHandler(err),
        });
      }
      user.salt = undefined;
      user.hashed_password = undefined;
      res.json({
        user,
      });
    });
  }
);

//@@Sign In
router.post("/singin", (req, res) => {
  //find user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        err: "User with that email does not exists. Please Sing up",
      });
    }
    //if user found match the password

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Emial and password dont match",
      });
    }
    //generate singe token with user id
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    //persist token as t in cookie expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    //return response with user and token client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
});

//@@Sign Out
router.post("/singin", (req, res) => {
  res.clearCookie("t");
  res.json({
    message: "Signout success",
  });
});

module.exports = router;
