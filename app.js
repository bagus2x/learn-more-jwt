const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
const AuthRoute = require("./Routes/Auth.route");
const { verifyAccessToken } = require("./helpers/jwt_helper");
require("./helpers/inti_mongodb");
require("./helpers/init_redis");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", verifyAccessToken, async (req, res, next) => {
  console.log(req.headers["authorization"]);
  res.send("hello world\n");
});

app.use("/auth", AuthRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
