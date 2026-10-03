import {
  requirePermission,
  requireSystemAdmin,
} from "../middlewares/permissionMiddleware.js";
import {
  inviteSubAdmin,
  listSubAdmins,
  updateSubAdminPermissions,
  revokeSubAdmin,
} from "../controllers/subAdminController.js";
import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import {
  getAllMembers,
  getMemberById,
  deleteMember,
  deactivateMember,
  reactivateMember,
  changeMemberEmail,
  getAllTrainers,
  getTrainerById,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  deactivateTrainer,
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

router
  .route("/members")
  .get(requirePermission("manage_members"), getAllMembers);

router
  .route("/members/:id")
  .get(requirePermission("manage_members"), getMemberById);

router
  .route("/members/delete/:id")
  .delete(requirePermission("manage_members"), deleteMember);
router
  .route("/members/deactivate/:id")
  .patch(requirePermission("manage_members"), deactivateMember);
router
  .route("/members/reactivate/:id")
  .patch(requirePermission("manage_members"), reactivateMember);
router
  .route("/members/change-email/:id")
  .patch(requirePermission("manage_members"), changeMemberEmail);

router
  .route("/trainers")
  .get(requirePermission("manage_trainers"), getAllTrainers);

router
  .route("/trainers/:id")
  .get(requirePermission("manage_trainers"), getTrainerById);

router
  .route("/trainers/add")
  .post(requirePermission("manage_trainers"), addTrainer);

router
  .route("/trainers/update/:id")
  .patch(
    requirePermission("manage_trainers"),
    upload.single("profilePicture"),
    updateTrainer,
  );

router
  .route("/trainers/delete/:id")
  .delete(requirePermission("manage_trainers"), deleteTrainer);
router
  .route("/trainers/deactivate/:id")
  .patch(requirePermission("manage_trainers"), deactivateTrainer);
router
  .route("/trainers/reactivate/:id")
  .patch(requirePermission("manage_trainers"), reactivateTrainer);

router
  .route("/trainers/performance/:id")
  .get(requirePermission("manage_trainers"), getTrainerPerformance);

router.route("/analytics/overview").get(requireSystemAdmin, getSystemOverview);

router.route("/analytics/revenue").get(requireSystemAdmin, getRevenueSummary);

router
  .route("/add-gym-plan")
  .post(requirePermission("manage_gym_plans"), addGymPlan);

router
  .route("/update-gym-plan/:id")
  .patch(requirePermission("manage_gym_plans"), updateGymPlan);

router
  .route("/delete-gym-plan/:id")
  .delete(requirePermission("manage_gym_plans"), deleteGymPlan);
router
  .route("/reactivate-gym-plan/:id")
  .patch(requirePermission("manage_gym_plans"), reactivateGymPlan);

router
  .route("/add-membership-plan")
  .post(requirePermission("manage_membership_plans"), addMembershipPlan);

router
  .route("/update-membership-plan/:id")
  .patch(requirePermission("manage_membership_plans"), updateMembershipPlan);

router
  .route("/delete-membership-plan/:id")
  .delete(requirePermission("manage_membership_plans"), deleteMembershipPlan);
router
  .route("/reactivate-membership-plan/:id")
  .patch(
    requirePermission("manage_membership_plans"),
    reactivateMembershipPlan,
  );

router.route("/sub-admins").get(requireSystemAdmin, listSubAdmins);
router.route("/sub-admins/invite").post(requireSystemAdmin, inviteSubAdmin);
router
  .route("/sub-admins/:id/permissions")
  .patch(requireSystemAdmin, updateSubAdminPermissions);
router
  .route("/sub-admins/revoke/:id")
  .delete(requireSystemAdmin, revokeSubAdmin);

export default router;
