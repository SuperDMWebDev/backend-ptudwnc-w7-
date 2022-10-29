//for generate radnom token
const randToken = require("rand-token");
// hash pwd
const bcrypt = require("bcrypt");

//model
const userModel = require("../users/users.model");

//method
const authMethod = require("./auth.method");

//variables
const jwtVariable = require("../../variables/jwt");
const { SALT_ROUNDS } = require("../../variables/auth");

//register account
exports.register = async (req, res) => {
  // get username
  console.log("register body", req.body);
  const username = req.body.username.toLowerCase();
  const user = await userModel.getUser(username);
  if (user) {
    res.status(409).send("Username is already in use");
  } else {
    const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
    const newUser = {
      username: username,
      password: hashPassword,
    };
    const createUser = await userModel.createUser(newUser);

    console.log("create user", createUser);
    if (!createUser) {
      res
        .status(400)
        .send(
          "There was an error in creating an account. Please try again after few minutes"
        );
    }
    return res.send({
      username,
    });
  }
};

//login account
exports.login = async (req, res) => {
  const username = req.body.username.toLowerCase() || "test";
  const password = req.body.password || "12345";

  const user = await userModel.getUser(username);
  if (!user) {
    return res.status(401).send("Account not found");
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send("Password is not valid");
  }

  const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

  const dataForAccessToken = {
    username: user.username,
  };
  // generate accesstoken
  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );

  if (!accessToken) {
    return res.status(401).send("Login failed");
  }

  // create refresh token
  let refreshToken = randToken.generate(jwtVariable.refreshTokenSize);

  if (!user.refreshToken) {
    // create user regfresh token
    await userModel.updateRefreshToken(user.username, refreshToken);
  } else {
    refreshToken = user.refreshToken;
  }

  return res.json({
    msg: "Login successful",
    accessToken,
    refreshToken,
    username: user.username,
  });
};

exports.refreshToken = async (req, res) => {
  // get access token from header
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(400).send("Sorry we couldn't find access token");
  }

  //get refresh token from body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).send("Sorry we couldn't find refresh token");
  }

  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
  const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

  //decode access token
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!decoded) {
    return res.status(400).send("Access token is not valid");
  }

  const username = decoded.payload.username;

  const user = await userModel.getUser(username);
  if (!user) {
    return res.status(401).send("User does not exist");
  }
  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).send("Refresh token does not exist");
  }

  const dataForAccessToken = {
    username,
  };

  // create new access token
  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res.status(400).send("Fail to create access token");
  }
  return res.json({
    accessToken,
  });
};
