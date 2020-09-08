const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/Auth.Controller");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refresh);
router.delete("/logout", logout);

module.exports = router;
