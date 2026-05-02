import User from "./userModel.js";
import mongoose from "mongoose";

const Trainer = User.discriminator("Trainer", new mongoose.Schema({
    expertise: {
        type: String,
        required: true,
    },
}));

export default Trainer;