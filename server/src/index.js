import "dotenv/config";
import express from "express";
import connectDB from "./db/index.js";
import { PORT, LIMIT } from "./constants.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

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

connectDB()
.then( () => {
    app.on("error", () => {
        console.log("Error in connecting express with mongodb", error);
        throw error;
    })
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
} )
.catch( (error) => {
    console.log("Error in executing mongodb connection", error);
    throw error;
} )