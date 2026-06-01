import express from "express";

import {
    addProduct,
    getProducts,
    getSingleProduct,
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

export default router;