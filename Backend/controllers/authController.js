const User = require("../models/User");
const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const validatePassword = require("../utils/validatePassword");

module.exports.register = async (req, res) => {
  const { name, email, password, institution } = req.body;

  try {
    // basic validation hai
    if (!name || !email || !password || !institution) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    //  Password strength validation
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number and special character",
      });
    }

    // checking existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generating otp
    const otp = generateOTP();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      institution,
      isVerified: false,
      emailVerificationOTP: hashedOtp,
      emailVerificationOTPExpiry: Date.now() + 10 * 60 * 1000,
    });

    // const token = generateToken(user._id);

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false, // must be false for localhost
    //   sameSite: "lax",
    //   maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    // });

    await sendEmail({
      to: user.email,
      subject: "Verify your EduCrit account",
      text: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
    });

    res.status(201).json({
      message: "Registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

module.exports.login = async function (req, res, next) {
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

    //blocking login if email not verified.
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // must be false for localhost
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    res.status(200).json({
      message: "Login Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        avatar: user.avatar,
      },
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

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    //  SECURITY: do not reveal if user exists
    if (!user) {
      return res.json({
        message: "If the email exists, an OTP has been sent",
      });
    }

    //  Generate OTP
    const otp = generateOTP();

    //  Hash OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    //  Send plain OTP to email
    await sendEmail({
      to: user.email,
      subject: "EduCrit Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({
      message: "If the email exists, an OTP has been sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// for OTP verification & Reset Password
module.exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Email, OTP, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number and special character",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOtp,
      resetPasswordOTPExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //  Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    //  Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;

    await user.save();

    res.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Security: do not reveal user existence
    if (!user) {
      return res.json({
        message: "If the email exists, a new OTP has been sent",
      });
    }

    // If already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.emailVerificationOTP = hashedOtp;

    user.emailVerificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Send email
    await sendEmail({
      to: user.email,
      subject: "EduCrit Email Verification OTP",
      text: `Your new verification OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({
      message: "Verification OTP resent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // OTP match + expiry check
    if (
      user.emailVerificationOTP !== hashedOtp ||
      user.emailVerificationOTPExpiry < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // ✅ Mark user verified
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
