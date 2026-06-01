import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["MembershipSubscription", "Order"],
    },
    paymentCauseId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "successful", "failed", "processing"],
    },
    trackerToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
