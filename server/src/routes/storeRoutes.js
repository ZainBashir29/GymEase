import express from "express";
import {
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
} from "../controllers/storeController.js";
const router = express.Router();

// Add product
router.post(
    "/products",
    addProduct
);
// Get all products
router.get(
    "/products",
    getProducts
);
// Get single product
router.get(
    "/products/:id",
    getSingleProduct
);
// Add product to cart
router.post(
    "/cart",
    addToCart
);
//Get cart
router.get(
    "/cart/:memberId",
    getCart
);
//update cart quantity
router.patch(
    "/cart/update",
    updateCartQuantity
);
//Remove from cart
router.delete(
    "/cart/remove",
    removeCartItem
);
//clear cart
router.delete(
    "/cart/clear",
    clearCart
);
// Checkout

router.get(
    "/checkout/:memberId",
    checkout
);

// Create order

router.post(
    "/orders",
    createOrder
);

// Get member orders
router.get(
    "/orders/:memberId",
    getMemberOrders
);
// Admin orders

router.get(
    "/admin/orders",
    getAllOrders
);

router.patch(
    "/admin/orders/:orderId/status",
    updateOrderStatus
);
export default router;