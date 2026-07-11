import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        minLength: 3,
    },
    details: [
        {
            type: String,
            required: true,
        }
    ],
    duration: {
        type: Number,
        required: true,
    },
    maxTrainers: {
        type: Number,
        required: true,
        default: 1,
    }
}, { timestamps: true })

const MembershipPlan = mongoose.model("MembershipPlan", membershipPlanSchema);

export default MembershipPlan;