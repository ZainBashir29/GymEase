import Cart from "../models/cartModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/orderModel.js";
import StoreProduct from "../models/storeProductModel.js";

// Add product
const addProduct = asyncHandler(
    async (request, response) => {
        const { name, description, price, stock, imageUrl, category,} = request.body;
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

// Add product to cart
const addToCart = asyncHandler(
    async (request, response) => {
        const {memberId, productId, quantity, } = request.body;
        console.log("Add To Cart Member ID:", memberId);
        if (!memberId || !productId) {
            throw new ApiError(
                400,
                "Member id and product id are required"
            );
        }
        const product =
            await StoreProduct.findById(
                productId
            );
        if (quantity > product.stock) {
            throw new ApiError(
                      400,
                        "Requested quantity exceeds available stock"
            );
        }
        else if (!product) {
            throw new ApiError(
                404,
                "Product not found"
            );
        }

        let cart =
            await Cart.findOne({
                memberId,
            });

        if (!cart) {
            cart =
                await Cart.create({
                    memberId,
                    products: [
                        {
                            productId,
                            quantity:
                                quantity || 1,
                        },
                    ],
                });
        } else {
            const existingProduct =
                cart.products.find(
                    (item) =>
                        item.productId.toString() ===
                        productId
                );

            if (existingProduct) 
                {existingProduct.quantity += quantity || 1;} 
                else {
                cart.products.push({
                    productId, quantity:quantity || 1,
                });
            }
            await cart.save();
        }
        return response.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Product added to cart"
            )
        );
    }
);

// Get cart
const getCart = asyncHandler(
    async (request, response) => {
        const { memberId } = request.params;
        const cart = await Cart.findOne({
            memberId,
        }).populate(
            "products.productId"
        );
        if (!cart) {
            throw new ApiError(
                404,
                "Cart not found"
            );
        }
        return response.status(200).json(
            new ApiResponse(
                200,
                cart,
                "Cart fetched successfully"
            )
        );
    }
);

// Update cart quantity
const updateCartQuantity =
    asyncHandler(
        async (
            request,
            response
        ) => {
            const {
                memberId,
                productId,
                quantity,
            } = request.body;
            const cart =
                await Cart.findOne({
                    memberId,
                });
            if (!cart) {
                throw new ApiError(
                    404,
                    "Cart not found"
                );
            }
            const cartItem =
                cart.products.find(
                    (item) =>
                        item.productId.toString() ===
                        productId
                );
            if (quantity > product.stock) {
                     throw new ApiError(
                          400,
                         "Requested quantity exceeds available stock"
                    );
                }
            if (!cartItem) {
                throw new ApiError(
                    404,
                    "Product not found in cart"
                );
            }
            cartItem.quantity =
                quantity;
            await cart.save();
            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        cart,
                        "Quantity updated successfully"
                    )
                );
        }
    );

// Remove cart item
const removeCartItem =
    asyncHandler(
        async (
            request,
            response
        ) => {
            const {
                memberId,
                productId,
            } = request.body;
            const cart =
                await Cart.findOne({
                    memberId,
                });
            if (!cart) {
                throw new ApiError(
                    404,
                    "Cart not found"
                );
            }
            cart.products =
                cart.products.filter(
                    (item) =>
                        item.productId.toString() !==
                        productId
                );
            await cart.save();
            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        cart,
                        "Product removed successfully"
                    )
                );
        }
    );

// Clear cart
const clearCart =
    asyncHandler(
        async (
            request,
            response
        ) => {
            const {
                memberId,
            } = request.body;
            const cart =
                await Cart.findOne({
                    memberId,
                });
            if (!cart) {
                throw new ApiError(
                    404,
                    "Cart not found"
                );
            }
            cart.products = [];
            await cart.save();
            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        cart,
                        "Cart cleared successfully"
                    )
                );
        }
    );
// Create order

const createOrder = asyncHandler(
    async (request, response) => {
        const { memberId } = request.body;
        const cart = await Cart.findOne({memberId,}).populate("products.productId");
        console.log("Create Order Member ID:", memberId);
        console.log("Cart Data:", JSON.stringify(cart, null, 2));
        if (!cart) {
            throw new ApiError(
                404,
                "Cart not found"
            );
        }
        if (
            cart.products.length === 0
        ) {
            throw new ApiError( 400, "Cart is empty");
        }
        let totalAmount = 0;
        for (const item of cart.products) {
            const product =
                item.productId;
            if (
                item.quantity >
                product.stock
            ) {
                throw new ApiError(
                    400,
                    `${product.name} is out of stock`
                );
            }
            totalAmount +=
                product.price *
                item.quantity;
        }
        const order =
            await Order.create({
                memberId,
                products:
                    cart.products,
                totalAmount,
                orderStatus:
                    "Pending",
            });

        for (const item of cart.products) {
            const product =
                await StoreProduct.findById(
                    item.productId._id
                );

            product.stock -=
                item.quantity;

            await product.save();
        }

        cart.products = [];

        await cart.save();

        return response.status(201).json(
            new ApiResponse(
                201,
                order,
                "Order created successfully"
            )
        );
    }
);
// Checkout cart

const checkout = asyncHandler(
    async (request, response) => {
        const { memberId } = request.params;

        const cart =
            await Cart.findOne({
                memberId,
            }).populate(
                "products.productId"
            );

        if (!cart) {
            throw new ApiError(
                404,
                "Cart not found"
            );
        }

        if (
            cart.products.length === 0
        ) {
            throw new ApiError(
                400,
                "Cart is empty"
            );
        }
        let subtotal = 0;
        for (const item of cart.products) {
            const product =
                item.productId;
            if (
                item.quantity >
                product.stock
            ) {
                throw new ApiError(
                    400,
                    `${product.name} is out of stock`
                );
            }
            subtotal += product.price * item.quantity;
        }
        const deliveryFee = 200;
        const totalAmount = subtotal + deliveryFee;
        return response.status(200).json(
            new ApiResponse(
                200,
                {
                    subtotal,
                    deliveryFee,
                    totalAmount,
                },
                "Checkout successful"
            )
        );
    }
);
// Get member orders

const getMemberOrders = asyncHandler(
    async (request, response) => {
        const { memberId } =
            request.params;

        const orders =
            await Order.find({
                memberId,
            })
                .populate(
                    "products.productId"
                )
                .sort({
                    createdAt: -1,
                });

        return response.status(200).json(
            new ApiResponse(
                200,
                orders,
                "Orders fetched successfully"
            )
        );
    }
);
// Get all orders

const getAllOrders = asyncHandler(
    async (request, response) => {
        const orders =
            await Order.find()
                .populate(
                    "memberId"
                )
                .populate(
                    "products.productId"
                )
                .sort({
                    createdAt: -1,
                });

        return response.status(200).json(
            new ApiResponse(
                200,
                orders,
                "Orders fetched successfully"
            )
        );
    }
);
// Update order status

const updateOrderStatus =
    asyncHandler(
        async (
            request,
            response
        ) => {
            const {
                orderStatus,
            } = request.body;

            const order =
                await Order.findById(
                    request.params.orderId
                );

            if (!order) {
                throw new ApiError(
                    404,
                    "Order not found"
                );
            }

            order.orderStatus =
                orderStatus;

            await order.save();

            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        order,
                        "Order status updated successfully"
                    )
                );
        }
    );
export {
    addProduct,
    getProducts,
    getSingleProduct,

    addToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,

    checkout,
    createOrder,

    getMemberOrders,

    getAllOrders,
    updateOrderStatus,
};