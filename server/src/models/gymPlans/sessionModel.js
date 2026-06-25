import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    gymPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymPlan",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
        required: true,
    },
    exercises: [
      {
        type: String,
        required: true,
      },
    ],
    day: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["completed", "missed", "upcoming"],
    },
  },
  {
    timestamps: true,
  },
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
