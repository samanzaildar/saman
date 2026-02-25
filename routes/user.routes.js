import express from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  getUserById,
  updateUserById,
  deleteUserById,
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/user/:id", getUserById);




router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.put("/", updateUser);
router.put("/user/:id", updateUserById);

router.delete("/", deleteUser);
router.delete("/user/:id", deleteUserById);

export default router;