import Payment from "../models/paymentModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import StoreProduct from "../models/storeProductModel.js";
import Safepay from "@sfpy/node-core";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const handleSuccessfulPayment = async (trackerToken) => {
  const payment = await Payment.findOne({ trackerToken });
  if (payment && payment.status === "successful") {
    return payment;
  }

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
    // Cancel any existing active subscriptions for this member
    await MembershipSubscription.updateMany(
      {
        memberId: updatedPayment.memberId,
        status: "active"
      },
      {
        $set: { status: "cancelled" }
      }
    );

    // Activate the newly paid pending subscription
    await MembershipSubscription.findOneAndUpdate(
      {
        membershipPlanId: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId,
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
  const updatedPayment = await Payment.findByIdAndUpdate(
    paymentId,
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
