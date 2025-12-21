const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.ststus(401).json({
      message: "Unauthorised",
    });
  }
};
