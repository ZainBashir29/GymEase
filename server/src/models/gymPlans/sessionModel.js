import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    memberPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberPlan",
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
    day: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    workoutName: {
      type: String,
      required: true,
    },
    exercises: [
      {
        name: String,
        sets: Number,
        reps: Number,
        duration: String,
      },
    ],
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
