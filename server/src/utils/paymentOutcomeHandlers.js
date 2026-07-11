import Payment from "../models/paymentModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import StoreOrder from "../models/storeOrderModel.js";

const handleSuccessfulPayment = async (trackerToken) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken },
    { $set: { status: "successful" } },
    { returnDocument: "after" },
  );

  if (!updatedPayment) {
    console.error(`Could not find payment for tracker ${trackerToken}`);
    return null;
  }

  if (updatedPayment.type === "MembershipSubscription") {
    await MembershipSubscription.findOneAndUpdate(
      {
        membershipPlanId: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId,
      },
      {
        $set: {
          status: "active",
          paymentId: updatedPayment._id,
        },
      },
      { returnDocument: "after" },
    );
  }

  if (updatedPayment.type === "StoreOrder") {
    await StoreOrder.findOneAndUpdate(
      {
        _id: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId,
      },
      {
        $set: {
          paymentStatus: "paid",
          status: "processing",
          paymentId: updatedPayment._id,
        },
      },
      { returnDocument: "after" },
    );
  }

  return updatedPayment;
};

const handleFailedPayment = async (trackerToken) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken },
    { $set: { status: "failed" } },
    { returnDocument: "after" },
  );

  if (!updatedPayment) {
    console.error(`Could not find payment for tracker ${trackerToken}`);
  }

  return updatedPayment;
};

export { handleSuccessfulPayment, handleFailedPayment };
