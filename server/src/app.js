import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { LIMIT } from "./constants.js";
import passport from "passport";
import "./services/passport.js";
import verifyJwt from "./middlewares/authMiddleware.js";
import { verifyWebhookSignature } from "./controllers/paymentController.js";
import ApiResponse from "./utils/ApiResponse.js";

const app = express();

app.set("trust proxy", 1);

app.use(passport.initialize());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) =>
      origin.trim().replace(/\/$/, ""),
    )
  : ["http://localhost:5173", "http://192.168.1.11:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*"))
        return callback(null, true);
      if (process.env.NODE_ENV === "development") return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true, limit: LIMIT }));

// kaleemullah ye special route hai, is ko express.raw required hai, isi liye isko express.json wali line ke uper likha hai
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  verifyWebhookSignature,
);

app.use(express.json({ limit: LIMIT }));

app.use(express.static("public"));

app.use(cookieParser());

// routes declaration
import authRoutes from "./routes/authRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import gymPlanRoutes from "./routes/gymPlanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import progressDataRoutes from "./routes/progressDataRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cronRoutes from "./routes/cronRoutes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/memberships", membershipRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/gym-plans", gymPlanRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/store", storeRoutes);
app.use("/api/v1/trainers", trainerRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/progress-data", progressDataRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/cron", cronRoutes);

app.get("/health-check", (req, res) => {
  res.status(200).json(new ApiResponse(200, {}, "Everything is working fine"));
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Maximum size is 5MB.";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
