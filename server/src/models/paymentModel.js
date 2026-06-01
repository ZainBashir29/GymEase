import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            default: "SadaPay",
        },

        paymentStatus: {
            type: String,
            default: "Pending",
        },

        transactionId: {
            type: String,
            required: true,
        },
    },

    {
        timestamps: true,
    }
);

const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

export default Payment;