const createError = require("http-errors");
const User = require("../models/User.model");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");
const client = require("../helpers/init_redis");

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const doesexist = await User.findOne({ email: result.email });
      if (doesexist)
        throw createError.Conflict(`${result.email} is already registered`);

      const user = new User(result);
      const savedUser = await user.save();
      const accessToken = await signAccessToken(savedUser.id);
      const refreshToken = await signRefreshToken(savedUser.id);
      res.send({ accessToken, refreshToken });
    } catch (err) {
      if (err.isJoi === true) err.status = 422;
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      const user = await User.findOne({ email: result.email });
      if (!user) throw createError.NotFound(`${result.email} not register`);

      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch)
        throw createError.Unauthorized("username/password not valid");

      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.send({ id: user.id, accessToken, refreshToken });
    } catch (e) {
      if (e.isJoi) {
        if (e.isJoi === true)
          return next(createError.BadRequest("Invalid Username/Password"));
      }
      next(e);
    }
  },
  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userID = await verifyRefreshToken(refreshToken);
      const newAccessToken = await signAccessToken(userID);
      const newRefreshToken = await signRefreshToken(userID);
      res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (e) {
      next(e);
    }
  },
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userID = await verifyRefreshToken(refreshToken);
      client.DEL(userID, (err, value) => {
        if (err) {
          console.log(err);
          throw createError.InternalServerError();
        }
        console.log(value);
        res.sendStatus(204);
      });
    } catch (e) {
      next(e);
      /* handle error */
    }
  },
};
