const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./init_redis");

module.exports = {
  signAccessToken: (userID) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      console.log(userID);
      const options = {
        expiresIn: "30s",
        issuer: "dmdkdmed.com",
        audience: userID,
      };
      const secret = process.env.ACCESS_TOKEN_SECRET;
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload;
      next();
    });
  },
  signRefreshToken: (userID) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      console.log(userID);
      const options = {
        expiresIn: "1y",
        issuer: "dmdkdmed.com",
        audience: userID,
      };
      const secret = process.env.REFRESH_TOKEN_SECRET;
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          return reject(createError.InternalServerError());
        }
        client.SET(userID, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            reject(createError.InternalServerError());
            return;
          }
          resolve(token);
        });
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized());
          const userID = payload.aud;
          client.GET(userID, (err, result) => {
            if (err) {
              console.log(err.message);
              reject(createError.InternalServerError());
              return;
            }
            if (refreshToken === result) return resolve(userID);
            reject(createError.Unauthorized());
          });
        }
      );
    });
  },
};
