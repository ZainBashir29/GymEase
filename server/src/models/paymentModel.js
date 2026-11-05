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
      enum: ["MembershipSubscription", "StoreOrder"],
    },
    membershipPaymentType: {
      type: String,
      enum: ["new_membership", "renewal", "plan_change", "returning_member"],
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
      // "review": gateway reported completion but verification (charged amount /
      // order ownership / order state) failed. NOT fulfilled; needs admin review.
      enum: ["pending", "successful", "failed", "refunded", "review"],
    },
    reviewReason: {
      type: String,
      default: null,
    },
    // Audit trail for payments resolved from the admin review queue.
    resolution: {
      action: {
        type: String,
        enum: ["approve", "refund", "reject", null],
        default: null,
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
      note: {
        type: String,
        trim: true,
        maxLength: 500,
        default: "",
      },
      // Lock to prevent concurrent resolutions (e.g. double refunds).
      inProgress: {
        type: Boolean,
        default: false,
      },
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

paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
