import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb connected successfully");
    } catch (error) {
        console.log("Mongodb connection failed:", error);
        throw error;  
    }
}

export default connectDB;