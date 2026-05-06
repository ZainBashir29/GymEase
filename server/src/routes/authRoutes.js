import { Router } from "express";
import { upload } from "../middlewares/multerMiddleware.js";
import { registerMember } from "../controllers/authController.js";

const router = Router();

router.route("member/register").post(upload.single("profilePicture"), registerMember);

export default router;