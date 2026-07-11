import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },

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

        status: {
            type: String,
            enum: [
                "Present",
                "Absent",
            ],
            required: true,
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

/* Prevent duplicate attendance for one session */
attendanceSchema.index(
    {
        sessionId: 1,
        memberId: 1,
    },
    {
        unique: true,
    }
);

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

export default Attendance;