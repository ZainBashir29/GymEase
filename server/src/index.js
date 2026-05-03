import "dotenv/config";
import express from "express";
import connectDB from "./db/index.js";
import { PORT } from "./constants.js";

const app = express();

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