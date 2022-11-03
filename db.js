const mysql = require("mysql");
require("dotenv").config();

//create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "123456",
  database: process.env.DB_NAME || "backend_ptudwnc_w7",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected", process.env.DB_HOST);
});

module.exports = db;
