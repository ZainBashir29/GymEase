import mongoose from "mongoose";

const membershipSubscriptionSchema = new mongoose.Schema(
  {
    membershipPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "active", "expired", "cancelled"],
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true },
);

const MembershipSubscription = mongoose.model(
  "MembershipSubscription",
  membershipSubscriptionSchema,
);

export default MembershipSubscription;
