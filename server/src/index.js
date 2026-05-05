import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";
import { PORT, LIMIT } from "./constants.js";
import cors from "cors";
import cookieParser from "cookie-parser";

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