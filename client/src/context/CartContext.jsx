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
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(false);

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const fetchCart = async (force = false) => {
    if (!force && (!user || user.role !== "Member")) return;
    try {
      const { data } = await api.get("/store/cart", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      setCart(data.data || { products: [] });
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error("Error fetching cart:", error);
      }
    }
  };

  const clearLocalCart = async () => {
    setCart({ products: [] });
    setCheckoutData(null);
    await fetchCart(true);
  };

  const refreshMembershipAndCart = async (optimisticActive = false) => {
    if (optimisticActive) {
      setHasActiveMembership(true);
    }
    setCheckingMembership(true);
    try {
      await api.get("/memberships/current", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      setHasActiveMembership(true);
      await fetchCart(true);
    } catch {
      if (!optimisticActive) {
        setHasActiveMembership(false);
        setCart({ products: [] });
      }
    } finally {
      setCheckingMembership(false);
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
      // openCart(); removed as per user request
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

  const fetchCheckoutPreview = async (fulfillmentMethod = "delivery") => {
    try {
      const { data } = await api.get("/store/checkout", {
        params: { fulfillmentMethod },
      });
      setCheckoutData(data.data);
    } catch (error) {
      console.error("Error fetching checkout preview:", error);
    }
  };

  const handleCheckout = async (checkoutPayload = {}) => {
    try {
      setLoading(true);
      const { data } = await api.post("/store/orders/create", checkoutPayload);
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
    let isMounted = true;

    const checkMembershipAndCart = async () => {
      if (!user || user.role !== "Member") {
        if (isMounted) {
          setHasActiveMembership(false);
          setCheckingMembership(false);
          setCart({ products: [] });
        }
        return;
      }

      setCheckingMembership(true);
      try {
        await api.get("/memberships/current", {
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        if (isMounted) {
          setHasActiveMembership(true);
          await fetchCart();
        }
      } catch {
        if (isMounted) {
          setHasActiveMembership(false);
          setCart({ products: [] });
        }
      } finally {
        if (isMounted) {
          setCheckingMembership(false);
        }
      }
    };

    checkMembershipAndCart();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (cart?.products?.length > 0 && isCartOpen && hasActiveMembership) {
      fetchCheckoutPreview();
    }
  }, [cart, isCartOpen, hasActiveMembership]);

  const itemCount = cart?.products?.length || 0;

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
        clearLocalCart,
        refreshMembershipAndCart,
        addToCart,
        updateQuantity,
        removeItem,
        checkoutData,
        fetchCheckoutPreview,
        handleCheckout,
        loading,
        hasActiveMembership,
        checkingMembership,
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
