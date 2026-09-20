import Payment from "../models/paymentModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import StoreProduct from "../models/storeProductModel.js";
import Safepay from "@sfpy/node-core";
import sendEmail from "./nodemailer.js";
import {
  getWelcomeMembershipEmail,
  getRenewalMembershipEmail,
  getStoreOrderEmail,
} from "../utils/emailTemplates.js";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const handleSuccessfulPayment = async (trackerToken) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken, status: "pending" },
    { $set: { status: "successful" } },
    { returnDocument: "after" },
  ).populate("memberId");

  if (!updatedPayment) {
    const existingPayment = await Payment.findOne({ trackerToken });
    if (existingPayment && existingPayment.status === "successful") {
      return existingPayment;
    }
    console.error(
      `Could not process payment for tracker ${trackerToken}. It may not exist or is not pending.`,
    );
    return null;
  }

  if (updatedPayment.type === "MembershipSubscription") {
    const existingActiveSub = await MembershipSubscription.findOne({
      memberId: updatedPayment.memberId._id,
      status: "active",
    });
    const isFirstTime = !existingActiveSub;

    await MembershipSubscription.updateMany(
      {
        memberId: updatedPayment.memberId._id,
        status: "active",
      },
      {
        $set: { status: "cancelled" },
      },
    );

    await MembershipSubscription.findOneAndUpdate(
      {
        membershipPlanId: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId._id,
        status: "pending",
      },
      {
        $set: {
          status: "active",
          paymentId: updatedPayment._id,
        },
      },
      { returnDocument: "after" },
    );

    const emailContent = isFirstTime
      ? getWelcomeMembershipEmail(
          updatedPayment.memberId.fullName,
          updatedPayment.amount,
        )
      : getRenewalMembershipEmail(
          updatedPayment.memberId.fullName,
          updatedPayment.amount,
        );

    sendEmail({
      to: updatedPayment.memberId.email,
      ...emailContent,
    }).catch((err) => console.error("Failed to send membership email:", err));
  }

  if (updatedPayment.type === "StoreOrder") {
    const order = await Order.findById(updatedPayment.paymentCauseId).populate(
      "products.productId",
    );

    if (!order) {
      console.error(`Order not found for payment ${updatedPayment._id}`);
      return updatedPayment;
    }

    const decrementedItems = [];
    let stockFailure = null;

    for (const item of order.products) {
      const updatedOrderItem = await StoreProduct.findOneAndUpdate(
        { _id: item.productId._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );

      if (!updatedOrderItem) {
        stockFailure = item.productId.name;
        break;
      }

      decrementedItems.push({
        productId: item.productId._id,
        quantity: item.quantity,
      });
    }

    if (stockFailure) {
      for (const item of decrementedItems) {
        await StoreProduct.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      try {
        await safepay.orders.payments.refund({
          tracker: updatedPayment.trackerToken,
          payload: { currency: "PKR", amount: updatedPayment.amount * 100 },
        });
      } catch (error) {
        console.error(`Refund failed for order ${order._id}:`, error?.message);
      }

      await Order.findByIdAndUpdate(order._id, {
        $set: {
          orderStatus: "Cancelled",
          paymentStatus: "refunded",
          paymentId: updatedPayment._id,
        },
      });

      console.log(
        `Order ${order._id} cancelled and refunded. ${stockFailure} was out of stock at the processing time.`,
      );

      return updatedPayment;
    }

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        paymentStatus: "paid",
        orderStatus: "Processing",
        paymentId: updatedPayment._id,
      },
    });

    await Cart.findOneAndUpdate(
      { memberId: order.memberId },
      { $set: { products: [] } },
    );

    const emailContent = getStoreOrderEmail(
      updatedPayment.memberId.fullName,
      updatedPayment.amount,
      order.products,
    );
    sendEmail({
      to: updatedPayment.memberId.email,
      ...emailContent,
    }).catch((err) => console.error("Failed to send store order email:", err));
  }

  return updatedPayment;
};

const handleFailedPayment = async (trackerToken) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken, status: "pending" },
    { $set: { status: "failed" } },
    { returnDocument: "after" },
  );

  if (!updatedPayment) {
    const existingPayment = await Payment.findOne({ trackerToken });
    if (existingPayment && existingPayment.status === "failed")
      return existingPayment;
    console.error(
      `Could not process failed payment for tracker ${trackerToken}.`,
    );
    return null;
  }

  if (updatedPayment.type === "MembershipSubscription") {
    await MembershipSubscription.findOneAndDelete({
      membershipPlanId: updatedPayment.paymentCauseId,
      memberId: updatedPayment.memberId,
      status: "pending",
    });
  }

  if (updatedPayment.type === "StoreOrder") {
    await Order.findByIdAndUpdate(updatedPayment?.paymentCauseId, {
      $set: {
        orderStatus: "Cancelled",
        paymentStatus: "failed",
      },
    });
  }

  return updatedPayment;
};

const handleRefundedPayment = async (paymentId) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: "successful" },
    { $set: { status: "refunded" } },
    { returnDocument: "after" },
  );

  if (!updatedPayment) {
    console.error(`Could not find payment ${paymentId} to mark as refunded`);
    return null;
  }

  if (updatedPayment.type === "MembershipSubscription") {
    const subscription = await MembershipSubscription.findOneAndUpdate(
      {
        membershipPlanId: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId,
      },
      { $set: { status: "cancelled" } },
      { returnDocument: "after" },
    );
  }

  if (updatedPayment.type === "StoreOrder") {
    const order = await Order.findByIdAndUpdate(
      updatedPayment.paymentCauseId,
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

  return updatedPayment;
};

export { handleSuccessfulPayment, handleFailedPayment, handleRefundedPayment };
