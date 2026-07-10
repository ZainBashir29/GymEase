import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import {
    getTrainerProfile,
    updateTrainerProfile,
    getAllTrainers,
    getTrainerById,
    assignMemberToTrainer,
    getAssignedMembers,
    removeAssignedMember,
} from "../controllers/trainerController.js";
const router = Router();

/* Get all trainers */
router.route("/getAllTrainers")
    .get(getAllTrainers);

/* Get and update logged in trainer profile */
router.route("/profile")
    .get(
        verifyJwt,
        getTrainerProfile
    )
    .patch(
        verifyJwt,
        updateTrainerProfile
    );

/* Get trainer by id */
router.route("/:trainerId")
    .get(getTrainerById);
/* Assign member */
router.route("/assign-member")
    .post(
        verifyJwt,
        assignMemberToTrainer
    );

/* Get assigned members */
router.route("/assigned-members")
    .get(
        verifyJwt,
        getAssignedMembers
    );

/* Remove assigned member */
router.route("/remove-member")
    .patch(
        verifyJwt,
        removeAssignedMember
    );
export default router;