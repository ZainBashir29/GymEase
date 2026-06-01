import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { LIMIT } from "./constants.js";
import passport from "passport";
import "./utils/passport.js";

const app = express();

app.use(passport.initialize());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.urlencoded({
    extended: true,
    limit: LIMIT,
}))

app.use(express.json({
    limit: LIMIT,
}))

app.use(express.static("public"));

app.use(cookieParser());

// routes
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payments", paymentRoutes);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    })
})

export default app;