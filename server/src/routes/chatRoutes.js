import { Router } from "express";

import {
    createConversation,
} from "../controllers/chatController.js";

const router = Router();

router.post(
    "/conversation",
    createConversation
);

export default router;