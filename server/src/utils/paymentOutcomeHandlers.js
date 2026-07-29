import Payment from "../models/paymentModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Order from "../models/orderModel.js";
import StoreProduct from "../models/storeProductModel.js";

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
    const order = await Order.findById(updatedPayment.paymentCauseId).populate(
      "products.productId",
    );

    if (!order) {
      console.error(`Order not found for payment ${updatedPayment._id}`);
      return updatedPayment;
    }

    for (const item of order.products) {
      const updated = await StoreProduct.findOneAndUpdate(
        { _id: item.productId._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );

      if (!updated) {
        console.error(
          `Insufficient stock for product ${item.productId._id} on order ${order._id}`,
        );

        const refundPayment = await safepay.orders.payments.refund({
          tracker: updatedPayment?.trackerToken,
          payload: {
            currency: "PKR",
            amount: item.quantity * item.price * 100,
          },
        });

        if (!refundPayment) {
          throw new ApiError(
            500,
            "Could not refund payment for the product out of stock",
          );
        }
      }
    }

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        paymentStatus: "paid",
        orderStatus: "Processing",
        paymentId: updatedPayment._id,
      },
    });
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

const handleRefundedPayment = async (paymentId) => {
  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    { $set: { status: "refunded" } },
    { returnDocument: "after" },
  );

  if (!payment) {
    console.error(`Could not find payment ${paymentId} to mark as refunded`);
    return null;
  }

  if (payment.type === "MembershipSubscription") {
    const subscription = await MembershipSubscription.findOneAndUpdate(
      {
        membershipPlanId: payment.paymentCauseId,
        memberId: payment.memberId,
      },
      { $set: { status: "cancelled" } },
      { returnDocument: "after" },
    );
  }

  if (payment.type === "StoreOrder") {
    const order = await Order.findByIdAndUpdate(
      payment.paymentCauseId,
      {
        $set: {
          orderStatus: "Cancelled",
          paymentStatus: "refunded",
        },
      },
      { returnDocument: "after" },
    ).populate("products.productId");

    if (order) {
      for (const item of order.products) {
        await StoreProduct.findByIdAndUpdate(item.productId?._id, {
          $inc: { stock: item.quantity },
        });
      }
    }
  }

  return payment;
};

export { handleSuccessfulPayment, handleFailedPayment, handleRefundedPayment };
