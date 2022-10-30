// library npm
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// file local
const authRouter = require("./src/auth/auth.route");
const userRouter = require("./src/users/users.route");

// dotenv
require("dotenv").config();

//initialize app
const app = express();

//intialize port
const port = process.env.PORT || 5000;

//app.use library
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get test return res.json
app.get("/test", (req, res) => {
  res.json({ message: "Test" });
});

// app.use link url
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.use("/", (req, res) => {
  res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
