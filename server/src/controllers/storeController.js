import StoreProduct from "../models/storeProductModel.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add product

const addProduct = asyncHandler(
    async (request, response) => {
        const {
            name,
            description,
            price,
            stock,
            imageUrl,
            category,
        } = request.body;

        if ( !name || !description ||  !price || !imageUrl || !category )
             {
            throw new ApiError(
                400,
                "All fields are required"
            );
        }

        const createdProduct =
            await StoreProduct.create({
                name,
                description,
                price,
                stock,
                imageUrl,
                category,
            });

        return response.status(201).json(
            new ApiResponse(
                201,
                createdProduct,
                "Product added successfully"
            )
        );
    }
);



// Get all products

const getProducts = asyncHandler(
    async (request, response) => {
        const products =
            await StoreProduct.find();

        return response.status(200).json(
            new ApiResponse(
                200,
                products,
                "Products fetched successfully"
            )
        );
    }
);



// Get single product

const getSingleProduct = asyncHandler(
    async (request, response) => {
        const product =
            await StoreProduct.findById(
                request.params.id
            );

        if (!product) {
            throw new ApiError(
                404,
                "Product not found"
            );
        }

        return response.status(200).json(
            new ApiResponse(
                200,
                product,
                "Product fetched successfully"
            )
        );
    }
);
export {
    addProduct,
    getProducts,
    getSingleProduct,
};