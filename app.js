const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan"); //for console logs
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const expressJwt = require("express-jwt");
//routes
const userRoutes = require("./routes/user");

//app

const app = express();

app.use(express.json());

//mongo
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("databse connected"));

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

//routes
app.use(userRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
