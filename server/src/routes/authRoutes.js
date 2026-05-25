import { Router } from "express";
import upload from "../middlewares/multerMiddleware.js";
import { login, registerMember, logout, googleCallback, completeProfile, refreshAccessToken, forgotPassword, changePassword } from "../controllers/authController.js";
import passport from "passport";
import verifyJwt from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/member/register").post(upload.single("profilePicture"), registerMember);

router.route("/login").post(login);

router.route("/logout").post(verifyJwt, logout);

router.route("/google").get(
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router
.route("/google/callback")
.get(passport.authenticate("google", { failureRedirect: "/login", session: false }), googleCallback);

router.route("/complete-profile").post(verifyJwt, completeProfile);

router.route("/forgot-password").post(forgotPassword);

router.route("/change-password/:token").post(changePassword);

router.route("/refresh-token").post(refreshAccessToken);

export default router;