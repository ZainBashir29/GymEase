import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ products: [] });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/store/cart");
      setCart(data.data || { products: [] });
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return;
    try {
      const { data } = await api.post("/store/cart/add", {
        productId,
        quantity,
      });

      await fetchCart();
      openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.patch("/store/cart/update", { productId, quantity });
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.response?.data?.message || "Failed to update quantity");
    }
  };
  const removeItem = async (productId) => {
    try {
      await api.delete(`/store/cart/remove/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const fetchCheckoutPreview = async () => {
    try {
      const { data } = await api.get("/store/checkout");
      setCheckoutData(data.data);
    } catch (error) {
      console.error("Error fetching checkout preview:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/store/orders/create");
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ products: [] });
    }
  }, [user]);

  useEffect(() => {
    if (cart?.products?.length > 0 && isCartOpen) {
      fetchCheckoutPreview();
    }
  }, [cart, isCartOpen]);

  const itemCount =
    cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isCartOpen,
        toggleCart,
        openCart,
        closeCart,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        checkoutData,
        handleCheckout,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
