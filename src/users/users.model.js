const db = require("../../db");
exports.getUser = (username) => {
  //select username sql
  const sql = "select * from accounts where username = ?";

  return new Promise((resolve, reject) => {
    db.query(sql, username, (err, response) => {
      if (err) return reject(err);
      return resolve(response[0]);
    });
  });
};

//create user
//user = {username: , password: 'password'};
exports.createUser = (user) => {
  const sql = "insert into accounts set ?";

  return new Promise((resolve, reject) => {
    db.query(sql, user, (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });
};

//delete user
exports.deleteUser = (username) => {
  const sql = "DELETE FROM accounts where username = ?";
  return new Promise((resolve, reject) => {
    db.query(sql, username, (err, response) => {
      if (err) return reject(err);
    });
  });
};

//update user
exports.updateUser = (user) => {
  const sql = " UPDATE accounts SET ? WHERE username = ? ";
  return new Promise((resolve, reject) => {
    db.query(sql, [user, user.name], (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });
};

// update user refresh token
exports.updateRefreshToken = async (username, refreshToken) => {
  try {
    await db
      .get("accounts")
      .find({ username: username })
      .assign({ refreshToken: refreshToken })
      .write();
  } catch (err) {
    console.log("err in updating refresh token");
  }
};
