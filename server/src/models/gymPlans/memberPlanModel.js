import mongoose from "mongoose";

const memberPlanSchema = new mongoose.Schema(
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
    duration: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "cancelled"],
    },
  },
  {
    timestamps: true,
  },
);

const MemberPlan = mongoose.model("MemberPlan", memberPlanSchema);

export default MemberPlan;
