import express from "express";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  reactivateProduct,
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
  deleteOrder,
} from "../controllers/storeController.js";
import requireActiveMembership from "../middlewares/requireActiveMembershipMiddleware.js";

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/products/:id").get(getSingleProduct);

router
  .route("/products/add")
  .post(verifyJwt, role("Admin"), requirePermission("manage_products"), upload.single("image"), addProduct);
router
  .route("/products/update/:id")
  .patch(verifyJwt, role("Admin"), requirePermission("manage_products"), upload.single("image"), updateProduct);
router
  .route("/products/delete/:id")
  .delete(verifyJwt, role("Admin"), requirePermission("manage_products"), deleteProduct);
router
  .route("/products/deactivate/:id")
  .patch(verifyJwt, role("Admin"), requirePermission("manage_products"), deactivateProduct);
router
  .route("/products/reactivate/:id")
  .patch(verifyJwt, role("Admin"), requirePermission("manage_products"), reactivateProduct);

router
  .route("/cart/add")
  .post(verifyJwt, role("Member"), requireActiveMembership, addToCart);
router.route("/cart").get(verifyJwt, role("Member"), getCart);
router
  .route("/cart/update")
  .patch(verifyJwt, role("Member"), updateCartQuantity);
router
  .route("/cart/remove/:productId")
  .delete(verifyJwt, role("Member"), removeCartItem);
router.route("/cart/clear").delete(verifyJwt, role("Member"), clearCart);

router
  .route("/checkout")
  .get(verifyJwt, role("Member"), requireActiveMembership, checkout);
router
  .route("/orders/create")
  .post(verifyJwt, role("Member"), requireActiveMembership, createOrder);
router.route("/orders/me").get(verifyJwt, role("Member"), getMemberOrders);

router.route("/orders").get(verifyJwt, role("Admin"), requirePermission("manage_orders"), getAllOrders);
router
  .route("/orders/update-status/:orderId")
  .patch(verifyJwt, role("Admin"), requirePermission("manage_orders"), updateOrderStatus);
router
  .route("/orders/delete/:orderId")
  .delete(verifyJwt, role("Admin"), requirePermission("manage_orders"), deleteOrder);

export default router;
