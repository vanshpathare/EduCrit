const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  const { name, email, password, institution } = req.body;

  try {
    if (!name || !email || !password || !institution) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      institution,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // must be false for localhost
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

module.exports.login = async function (req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "All feilds are required",
      });
    }

    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // must be false for localhost
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    res.status(200).json({
      message: "Login Successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

module.exports.profile = (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};
