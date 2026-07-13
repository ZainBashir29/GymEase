import mongoose from "mongoose";

const progressDataSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
    remainingDays: {
      type: Number,
      required: true,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const ProgressData = mongoose.model("ProgressData", progressDataSchema);

export default ProgressData;