import User from "./userModel.js";
import mongoose from "mongoose";

const Member = User.discriminator("Member", new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
        min: 13,
    },
    googleId: {
        type: String,
    }
}))

export default Member;