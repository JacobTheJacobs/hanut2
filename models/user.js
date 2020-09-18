const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    hashed_password: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.virtual("password")
  //set
  .set(function (password) {
    this._password = password; //temp
    this._salt = uuidv1(); //random string
    this.hashed_password = this.encryptPassword(password);
  })
  //get
  .get(function () {
    return this._password;
  });

//METHODS
UserSchema.methods = {
  //comparing the password
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  //encrypting the password
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto //from crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", UserSchema);
