import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
    {
        trainerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trainer",
            required: true,
        },

        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },

        sessionType: {
            type: String,
            enum: [
                "Morning",
                "Afternoon",
                "Evening",
            ],
            required: true,
        },

        sessionDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Completed",
                "Missed",
            ],
            default: "Pending",
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);
sessionSchema.index(
    {
        trainerId: 1,
        memberId: 1,
        sessionDate: 1,
        sessionType: 1,
    },
    {
        unique: true,
    }
);
const Session = mongoose.model("Session",sessionSchema);
export default Session;