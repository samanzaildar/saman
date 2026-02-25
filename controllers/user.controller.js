import User from "../models/user.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();

function middleware(req, res, next) {
  console.log("Middleware working ");
  next();
}
app.use(middleware);

// Signup 
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password required" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    //  OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.create({ name, email, password: hashedPassword, otp, emailVerified: false });
    res.status(201).json({ message: "Signup successful, OTP sent to email", userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Login 
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ error: "Email not verified. Please verify OTP." });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
// Verify OTP 
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ error: "User ID and OTP required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    user.emailVerified = true;
    user.otp = null;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Resend OTP 
export const resendOtp = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();
    res.json({ message: "OTP resent to email" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


// Update user
export const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and name required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


// Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    res.status(200).json({
      message: "User fetched successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error"
    });
  }
};



// update the user by ID
export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error"
    });
  }
};

// delete the user by ID
export const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error"
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const resetToken = Math.random().toString(36).substr(2, 8);
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 minutes expiry
    await user.save();
    res.json({ message: "Reset token sent to email", resetToken });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ error: "Email, reset token, and new password required" });
  }
  try {
    const user = await User.findOne({ email, resetToken });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export default { middleware };