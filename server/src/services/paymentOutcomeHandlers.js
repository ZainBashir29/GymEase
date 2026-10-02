import Payment from "../models/paymentModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import StoreProduct from "../models/storeProductModel.js";
import Safepay from "@sfpy/node-core";
import sendEmail from "./nodemailer.js";
import {
  getMembershipReceiptEmail,
  getStoreOrderEmail,
} from "../utils/emailTemplates.js";
import { resumePausedMemberPlan } from "../controllers/gymPlanController.js";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const getMembershipPaymentType = async (memberId, planId) => {
  const existingActiveMembership = await MembershipSubscription.findOne({
    memberId,
    status: "active",
  }).populate("membershipPlanId", "_id");

  if (existingActiveMembership) {
    return existingActiveMembership.membershipPlanId?._id.toString() ===
      String(planId)
      ? "renewal"
      : "plan_change";
  }

  const hasPreviousMembership = await MembershipSubscription.exists({
    memberId,
    status: { $in: ["expired", "cancelled"] },
  });

  if (hasPreviousMembership) {
    return "returning_member";
  }

  return "new_membership";
};

const handleSuccessfulPayment = async (trackerToken) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken, status: "pending" },
    { $set: { status: "successful" } },
    { returnDocument: "after" },
  ).populate("memberId");

  if (!updatedPayment) {
    const existingPayment = await Payment.findOne({ trackerToken }).populate("memberId");
    if (existingPayment && existingPayment.status === "successful") {
      if (existingPayment.type === "MembershipSubscription") {
        const memberId = existingPayment.memberId?._id || existingPayment.memberId;
        const activeSub = await MembershipSubscription.findOne({
          memberId,
          status: "active",
        });
        if (!activeSub) {
          const plan = await MembershipPlan.findById(existingPayment.paymentCauseId);
          const durationDays = plan?.duration || 30;
          const startDate = new Date();
          const endDate = new Date(
            startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
          );
          await MembershipSubscription.create({
            membershipPlanId: existingPayment.paymentCauseId,
            memberId,
            startDate,
            endDate,
            status: "active",
            paymentId: existingPayment._id,
          });
        }
      }
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
    }).populate("membershipPlanId", "name");

    const hasPreviousMembership = !existingActiveSub
      ? await MembershipSubscription.exists({
        memberId: updatedPayment.memberId._id,
        status: { $in: ["expired", "cancelled"] },
      })
      : false;

    await MembershipSubscription.updateMany(
      {
        memberId: updatedPayment.memberId._id,
        status: "active",
      },
      {
        $set: { status: "cancelled" },
      },
    );

    let activatedSubscription = await MembershipSubscription.findOneAndUpdate(
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
    ).populate("membershipPlanId", "name");

    if (!activatedSubscription) {
      activatedSubscription = await MembershipSubscription.findOne({
        paymentId: updatedPayment._id,
        status: "active",
      }).populate("membershipPlanId", "name");
    }

    if (!activatedSubscription) {
      activatedSubscription = await MembershipSubscription.findOneAndUpdate(
        {
          memberId: updatedPayment.memberId._id,
          status: "pending",
        },
        {
          $set: {
            membershipPlanId: updatedPayment.paymentCauseId,
            status: "active",
            paymentId: updatedPayment._id,
          },
        },
        { returnDocument: "after" },
      ).populate("membershipPlanId", "name");
    }

    if (!activatedSubscription) {
      const plan = await MembershipPlan.findById(updatedPayment.paymentCauseId);
      const durationDays = plan?.duration || 30;
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
      );
      activatedSubscription = await MembershipSubscription.create({
        membershipPlanId: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId._id,
        startDate,
        endDate,
        status: "active",
        paymentId: updatedPayment._id,
      });
      await activatedSubscription.populate("membershipPlanId", "name");
    }

    const previousPlanName = existingActiveSub?.membershipPlanId?.name;
    const membershipPaymentType =
      updatedPayment.membershipPaymentType ||
      (await getMembershipPaymentType(
        updatedPayment.memberId._id,
        updatedPayment.paymentCauseId,
      ));
    updatedPayment.membershipPaymentType = membershipPaymentType;

    const membershipEvent =
      membershipPaymentType === "renewal"
        ? "renewed"
        : membershipPaymentType === "plan_change"
          ? "plan_changed"
          : membershipPaymentType === "returning_member"
            ? "returning_member"
            : "first_purchase";

    const emailContent = getMembershipReceiptEmail({
      userName: updatedPayment.memberId.fullName,
      amount: updatedPayment.amount,
      paymentId: updatedPayment._id.toString(),
      planName: activatedSubscription.membershipPlanId?.name || "Membership",
      startDate: activatedSubscription.startDate,
      endDate: activatedSubscription.endDate,
      membershipEvent,
      previousPlanName,
    });

    sendEmail({
      to: updatedPayment.memberId.email,
      ...emailContent,
    }).catch((err) => console.error("Failed to send membership email:", err));

    if (membershipPaymentType === "renewal" || membershipPaymentType === "returning_member") {
      resumePausedMemberPlan(updatedPayment.memberId._id).catch(err =>
        console.error("Failed to auto-resume member gym plan after payment:", err)
      );
    }
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

    const emailContent = getStoreOrderEmail({
      userName: updatedPayment.memberId.fullName,
      amount: updatedPayment.amount,
      paymentId: updatedPayment._id.toString(),
      order,
    });
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
    updatedPayment.membershipPaymentType =
      updatedPayment.membershipPaymentType ||
      (await getMembershipPaymentType(
        updatedPayment.memberId,
        updatedPayment.paymentCauseId,
      ));

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
