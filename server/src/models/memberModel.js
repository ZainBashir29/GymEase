import User from "./userModel.js";
import mongoose from "mongoose";

const Member = User.discriminator("Member", new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 13,
    },
    authMethod: {
        type: String,
        required: true,
        enum: ["email", "google"],
    },
    googleId: {
        type: String,
        default: null
    }
}))

export default Member;