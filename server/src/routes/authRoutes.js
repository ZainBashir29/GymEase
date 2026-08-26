import { Router } from "express";
import upload from "../middlewares/multerMiddleware.js";
import {
  login,
  registerMember,
  logout,
  googleCallback,
  completeProfile,
  refreshAccessToken,
  forgotPassword,
  changePassword,
  updateFullName,
  updateUsername,
  updateEmail,
  changeCurrentPassword,
  changeProfilePicture,
  deleteAccount,
  getCurrentUser,
} from "../controllers/authController.js";
import passport from "passport";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";

const router = Router();

router
  .route("/member/register")
  .post(upload.single("profilePicture"), registerMember);

router.route("/login").post(login);

router
  .route("/logout")
  .post(verifyJwt, role("Member", "Trainer", "Admin"), logout);

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.route("/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback,
);

router
  .route("/complete-profile")
  .post(verifyJwt, role("Member"), completeProfile);

router
  .route("/forgot-password")
  .post(forgotPassword);

router
  .route("/change-password/:token")
  .post(changePassword);

router
  .route("/refresh-token")
  .post(role("Member", "Trainer", "Admin"), refreshAccessToken);

router
  .route("/member/update/full-name")
  .patch(verifyJwt, role("Member"), updateFullName);

router
  .route("/member/update/username")
  .patch(verifyJwt, role("Member"), updateUsername);

router
  .route("/member/update/email")
  .patch(verifyJwt, role("Member"), updateEmail);

router
  .route("/member/change/password")
  .patch(verifyJwt, role("Member"), changeCurrentPassword);

router
  .route("/member/change/profile-picture")
  .patch(
    verifyJwt,
    role("Member"),
    upload.single("profilePicture"),
    changeProfilePicture,
  );

router.route("/member/delete").delete(verifyJwt, role("Member"), deleteAccount);

router
  .route("/current-user")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), getCurrentUser);

export default router;
