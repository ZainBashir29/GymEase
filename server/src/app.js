import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { LIMIT } from "./constants.js";
import passport from "passport";
import "./utils/passport.js";
import verifyJwt from "./middlewares/authMiddleware.js";
import { verifyWebhookSignature } from "./controllers/paymentController.js";
import chatRoutes from "./routes/chatRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
const app = express();

import storeRoutes from "./routes/storeRoutes.js";
import verifyJwt from "./middlewares/authMiddleware.js";
import { verifyWebhookSignature } from "./controllers/paymentController.js";


app.use( "/api/store", storeRoutes);

app.use("/api/messages",messageRoutes);
app.use("/api/conversations",conversationRoutes);
app.use("/api/progress",progressRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/sessions",sessionRoutes);
app.use("/api/trainers",trainerRoutes);
app.use(passport.initialize());
app.use( "/api/chat",chatRoutes);
app.use(cors({origin: process.env.CORS_ORIGIN,credentials: true,}),);
app.use(express.urlencoded({extended: true,limit: LIMIT,}),);

// kaleemullah ye special route hai, is ko express.raw required hai, isi liye isko express.json wali line ke uper likha hai
app.post( "api/v1/payments/webhook",express.raw({ type: "application/json" }),verifyWebhookSignature,);

app.use(express.json({limit: LIMIT,}),);
app.use(express.static("public"));
app.use(cookieParser());

// routes
import authRoutes from "./routes/authRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import gymPlanRoutes from "./routes/gymPlanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/memberships", membershipRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/gym-plans", gymPlanRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
