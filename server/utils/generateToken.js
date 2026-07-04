const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for a given user ID.
 * @param {string} id - MongoDB user ObjectId
 * @returns {string} JWT token string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = generateToken;
