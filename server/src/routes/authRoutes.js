import { Router } from "express";
import upload from "../middlewares/multerMiddleware.js";
import { login, registerMember, logout, googleCallback, completeProfile, refreshAccessToken, forgotPassword, changePassword, updateFullName, updateUsername, updateEmail, changeCurrentPassword, changeProfilePicture, getCurrentUser } from "../controllers/authController.js";
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

router.route("/refresh-access-token").post(refreshAccessToken);

router.route("/member/update/full-name").patch(verifyJwt, updateFullName);

router.route("/member/update/username").patch(verifyJwt, updateUsername);

router.route("/member/update/email").patch(verifyJwt, updateEmail);

router.route("/member/change/password").patch(verifyJwt, changeCurrentPassword);

router.route("/member/change/profile-picture").patch(verifyJwt, upload.single("profilePicture"), changeProfilePicture);

router.route("/current-user").get(verifyJwt, getCurrentUser);

export default router;