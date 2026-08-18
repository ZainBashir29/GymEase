import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import StoreProduct from "../models/storeProductModel.js";
import Payment from "../models/paymentModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createPaymentSession,
  createAuthenticationToken,
  getCheckoutUrl,
} from "../services/safepay.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.js";

const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !description || !price || !category) {
    throw new ApiError(400, "All fields are required");
  }

  if (price <= 0) {
    throw new ApiError(400, "Price must be greater than 0");
  }

  const imagePath = req.file?.path;

  if (!imagePath) {
    throw new ApiError(400, "Product image is required");
  }

  const productImage = await uploadOnCloudinary(imagePath);

  const createdProduct = await StoreProduct.create({
    name,
    description,
    price,
    stock,
    imageUrl: productImage?.url || "",
    imagePublicId: productImage?.public_id || "",
    category,
  });

  res
    .status(201)
    .json(new ApiResponse(201, createdProduct, "Product added successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid product id");
  }

  const allowedUpdateFields = [
    "name",
    "description",
    "price",
    "stock",
    "category",
    "isActive",
  ];

  const product = await StoreProduct.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updates = {};
  for (const field of allowedUpdateFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const productImageLocalPath = req.file?.path;
  const previousPublicId = product.imagePublicId;

  if (productImageLocalPath) {
    const productImage = await uploadOnCloudinary(productImageLocalPath);

    if (!productImage) {
      throw new ApiError(500, "Could not upload product image to cloudinary");
    }

    updates.imageUrl = productImage?.url || "";
    updates.imagePublicId = productImage?.public_id || "";
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  if (updates.price !== undefined && updates.price <= 0) {
    throw new ApiError(400, "Price must be greater than 0");
  }

  const updatedProduct = await StoreProduct.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after" },
  );

  if (!updatedProduct) {
    throw new ApiError(500, "Could not update product");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid product id");
  }

  const product = await StoreProduct.findById(id);

  if (!product) throw new ApiError(404, "Product not found");

  if (!product.isActive)
    throw new ApiError(400, "Product is already deactivated");

  product.isActive = false;

  await product.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product deactivated successfully"));
});

const getProducts = asyncHandler(async (req, res) => {
  const filter = req.query.includeInactive === "true" ? {} : { isActive: true };

  const products = await StoreProduct.find(filter);

  res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid product id");
  }

  const product = await StoreProduct.findById(id);

  if (!product) throw new ApiError(404, "Product not found");

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const addToCart = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;
  const { productId, quantity } = req.body;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "No or invalid product id");
  }

  const product = await StoreProduct.findById(productId);

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  const requestedQuantity = quantity || 1;

  if (requestedQuantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  let cart = await Cart.findOne({ memberId });

  if (!cart) {
    cart = await Cart.create({
      memberId,
      products: [{ productId, quantity: requestedQuantity }],
    });
  } else {
    const existingProduct = cart.products.find(
      (item) => item.productId.toString() == productId,
    );

    if (existingProduct) {
      existingProduct.quantity += requestedQuantity;
    } else {
      cart.products.push({ productId, quantity: requestedQuantity });
    }
    await cart.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Product added to cart successfully"));
});

const getCart = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;

  const cart = await Cart.findOne({ memberId }).populate("products.productId");

  if (!cart) {
    return res
      .status(200)
      .json(new ApiResponse(200, { products: [] }, "Cart is empty"));
  }

  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const updateCartQuantity = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    throw new ApiError(400, "Product id and quantity are required");
  }

  const cart = await Cart.findOne({ memberId });

  if (!cart) throw new ApiError(404, "Cart not found");

  const cartItem = cart.products.find(
    (item) => item.productId.toString() == productId,
  );

  if (!cartItem) throw new ApiError(404, "Product not found in cart");

  const product = await StoreProduct.findById(productId);

  if (!product) throw new ApiError(404, "Product no longer exists");

  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  cartItem.quantity = quantity;
  await cart.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Quantity updated successfully"));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ memberId });

  if (!cart) throw new ApiError(404, "Cart not found");

  cart.products = cart.products.filter(
    (item) => item.productId.toString() !== productId,
  );

  await cart.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Product removed successfully"));
});

const clearCart = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;

  const cart = await Cart.findOne({ memberId });

  if (!cart) throw new ApiError(404, "Cart not found");

  cart.products = [];
  await cart.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

const checkout = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;

  const cart = await Cart.findOne({ memberId }).populate("products.productId");

  if (!cart || cart.products.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let subtotal = 0;
  for (const item of cart.products) {
    const product = item.productId;
    if (item.quantity > product.stock) {
      throw new ApiError(400, `${product.name} is out of stock`);
    }
    subtotal += product.price * item.quantity;
  }

  const deliveryFee = 200;
  const totalAmount = subtotal + deliveryFee;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subtotal, deliveryFee, totalAmount },
        "Checkout preview generated successfully",
      ),
    );
});

const createOrder = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;

  const cart = await Cart.findOne({ memberId }).populate("products.productId");

  if (!cart || cart.products.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let totalAmount = 0;
  for (const item of cart.products) {
    const product = item.productId;
    if (!product || !product.isActive) {
      throw new ApiError(400, `A product in your cart is no longer available`);
    }
    if (item.quantity > product.stock) {
      throw new ApiError(400, `${product.name} is out of stock`);
    }
    totalAmount += product.price * item.quantity;
  }

  const deliveryFee = 200;
  const finalAmount = totalAmount + deliveryFee;

  const order = await Order.create({
    memberId,
    products: cart.products.map((item) => ({
      productId: item.productId?._id,
      quantity: item.quantity,
    })),
    totalAmount: finalAmount,
    orderStatus: "Pending",
    paymentStatus: "pending",
  });

  if (!order) {
    throw new ApiError(500, "Could not create order");
  }

  const session = await createPaymentSession(finalAmount, order._id);

  if (!session) {
    throw new ApiError(500, "Could not create payment session");
  }

  const trackerToken = session.data?.tracker?.token;
  const authToken = await createAuthenticationToken();

  if (!authToken?.data) {
    throw new ApiError(
      500,
      "Could not create authentication token for payment",
    );
  }

  const checkoutUrl = await getCheckoutUrl(trackerToken, authToken.data);

  if (!checkoutUrl) {
    throw new ApiError(500, "Could not create checkout url");
  }

  const pendingPaymentRecord = await Payment.create({
    memberId,
    type: "StoreOrder",
    paymentCauseId: order._id,
    amount: finalAmount,
    status: "pending",
    trackerToken,
  });

  if (!pendingPaymentRecord) {
    throw new ApiError(500, "Could not create payment record in db");
  }

  cart.products = [];
  await cart.save({ validateBeforeSave: false });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { order, paymentRecord: pendingPaymentRecord, checkoutUrl },
        "Order created successfully, proceed to checkout url to complete payment",
      ),
    );
});

const getMemberOrders = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;

  const orders = await Order.find({ memberId })
    .populate("products.productId")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Member's orders fetched successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("memberId", "fullName email")
    .populate("products.productId")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "No or invalid order id");
  }

  const validStatuses = [
    "Pending",
    "Paid",
    "Processing",
    "Delivered",
    "Cancelled",
  ];
  if (!orderStatus || !validStatuses.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) throw new ApiError(404, "Order not found");

  order.orderStatus = orderStatus;
  await order.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

export {
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
};
