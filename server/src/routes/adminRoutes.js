import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import {
  getAllMembers,
  getMemberById,
  deleteMember,
  getAllTrainers,
  getTrainerById,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainerPerformance,
  getSystemOverview,
  getRevenueSummary,
  addGymPlan,
  updateGymPlan,
  deleteGymPlan,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
} from "../controllers/adminController.js";

const router = Router();

router.use(verifyJwt, role("Admin"));

router.route("/members").get(getAllMembers);

router.route("/members/:id").get(getMemberById);

router.route("/members/delete/:id").delete(deleteMember);

router.route("/trainers").get(getAllTrainers);

router.route("/trainers/:id").get(getTrainerById);

router.route("/trainers/add").post(addTrainer);

router
  .route("/trainers/update/:id")
  .patch(upload.single("profilePicture"), updateTrainer);

router.route("/trainers/delete/:id").delete(deleteTrainer);

router.route("/trainers/performance/:id").get(getTrainerPerformance);

router.route("/analytics/overview").get(getSystemOverview);

router.route("/analytics/revenue").get(getRevenueSummary);

router.route("/add-gym-plan").post(addGymPlan);

router.route("/update-gym-plan/:id").patch(updateGymPlan);

router.route("/delete-gym-plan/:id").delete(deleteGymPlan);

router.route("/add-membership-plan").post(addMembershipPlan);

router.route("/update-membership-plan/:id").patch(updateMembershipPlan);

router.route("/delete-membership-plan/:id").delete(deleteMembershipPlan);

export default router;
