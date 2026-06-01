import mongoose from "mongoose";

const storeProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        stock: {
            type: Number,
            default: 0,
        },

        imageUrl: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: [
                "Supplement",
                "Gym Gear",
            ],
            required: true,
        },
    },

    {
        timestamps: true,
    }
);

const StoreProduct = mongoose.model(
    "StoreProduct",
    storeProductSchema
);

export default StoreProduct;