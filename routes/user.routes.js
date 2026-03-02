import express from "express";
import {getUsers,updateUser,deleteUser,getUserById,updateUserById,deleteUserById,signup,login,verifyOtp,resendOtp,forgotPassword,
  resetPassword, uploadProfileImage} from "../controllers/user.controller.js";

import { simpleAuth } from "../middleware/simpleAuth.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", simpleAuth, getUsers);
router.get("/user/:id", simpleAuth, getUserById);


router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/upload-profile-image",upload.single("avatar"),uploadProfileImage);

router.put("/", simpleAuth, updateUser);
router.put("/user/:id", updateUserById);

router.delete("/", simpleAuth, deleteUser);
router.delete("/user/:id", deleteUserById);

export default router;