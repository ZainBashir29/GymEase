import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },

        products: [
            {
                productId: {
                    type:
                        mongoose.Schema.Types.ObjectId,

                    ref: "StoreProduct",
                },

                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],

        totalAmount: {
            type: Number,
            required: true,
        },

        orderStatus: {
            type: String,
            default: "Pending",
        },
    },

    {
        timestamps: true,
    }
);

const Order = mongoose.model(
    "Order",
    orderSchema
);

export default Order;