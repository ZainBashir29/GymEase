import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import {
  getAllMembers,
  getMemberById,
  deleteMember,
  reactivateMember,
  getAllTrainers,
  getTrainerById,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  reactivateTrainer,
  getTrainerPerformance,
  getSystemOverview,
  getRevenueSummary,
  addGymPlan,
  updateGymPlan,
  deleteGymPlan,
  reactivateGymPlan,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  reactivateMembershipPlan,
} from "../controllers/adminController.js";

const router = Router();

router.use(verifyJwt, role("Admin"));

router.route("/members").get(getAllMembers);

router.route("/members/:id").get(getMemberById);

router.route("/members/delete/:id").delete(deleteMember);
router.route("/members/reactivate/:id").patch(reactivateMember);

router.route("/trainers").get(getAllTrainers);

router.route("/trainers/:id").get(getTrainerById);

router.route("/trainers/add").post(addTrainer);

router
  .route("/trainers/update/:id")
  .patch(upload.single("profilePicture"), updateTrainer);

router.route("/trainers/delete/:id").delete(deleteTrainer);
router.route("/trainers/reactivate/:id").patch(reactivateTrainer);

router.route("/trainers/performance/:id").get(getTrainerPerformance);

router.route("/analytics/overview").get(getSystemOverview);

router.route("/analytics/revenue").get(getRevenueSummary);

router.route("/add-gym-plan").post(addGymPlan);

router.route("/update-gym-plan/:id").patch(updateGymPlan);

router.route("/delete-gym-plan/:id").delete(deleteGymPlan);
router.route("/reactivate-gym-plan/:id").patch(reactivateGymPlan);

router.route("/add-membership-plan").post(addMembershipPlan);

router.route("/update-membership-plan/:id").patch(updateMembershipPlan);

router.route("/delete-membership-plan/:id").delete(deleteMembershipPlan);
router
  .route("/reactivate-membership-plan/:id")
  .patch(reactivateMembershipPlan);

export default router;
