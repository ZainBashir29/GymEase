import express from "express";
import { verifyJwt } from "../middlewares/authMiddleware.js";
import { role } from "../middlewares/roleMiddleware.js";
import {
  addProduct,
  updateProduct,
  deleteProduct,
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

router.route("/products").get(getProducts);
router.route("/products/:id").get(getSingleProduct);

router.route("/products/add").post(verifyJwt, role("Admin"), addProduct);
router
  .route("/products/update/:id")
  .patch(verifyJwt, role("Admin"), updateProduct);
router
  .route("/products/delete/:id")
  .delete(verifyJwt, role("Admin"), deleteProduct);

router.route("/cart/add").post(verifyJwt, role("Member"), addToCart);
router.route("/cart").get(verifyJwt, role("Member"), getCart);
router
  .route("/cart/update")
  .patch(verifyJwt, role("Member"), updateCartQuantity);
router
  .route("/cart/remove/:productId")
  .delete(verifyJwt, role("Member"), removeCartItem);
router.route("/cart/clear").delete(verifyJwt, role("Member"), clearCart);

router.route("/checkout").get(verifyJwt, role("Member"), checkout);
router.route("/orders/create").post(verifyJwt, role("Member"), createOrder);
router.route("/orders/me").get(verifyJwt, role("Member"), getMemberOrders);

router.route("/orders").get(verifyJwt, role("Admin"), getAllOrders);
router
  .route("/orders/update-status/:orderId")
  .patch(verifyJwt, role("Admin"), updateOrderStatus);

export default router;
