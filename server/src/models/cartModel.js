import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
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
    },

    {
        timestamps: true,
    }
);

const Cart = mongoose.model(
    "Cart",
    cartSchema
);

export default Cart;