import { useState, useEffect } from "react";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Loader2,
  Truck,
  Store,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    checkoutData,
    fetchCheckoutPreview,
    handleCheckout,
    loading,
  } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState("cart"); // "cart" | "details"
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      setRecipientName((prev) => prev || user.fullName || "");
      setPhone((prev) => prev || user.phone || "");
      setAddress((prev) => prev || user.address || "");
      setCity((prev) => prev || user.city || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isCartOpen) {
      setStep("cart");
    }
  }, [isCartOpen]);

  const handleFulfillmentChange = (method) => {
    setFulfillmentMethod(method);
    fetchCheckoutPreview(method);
  };

  const computedSubtotal =
    checkoutData?.subtotal ??
    (cart?.products?.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * (item.quantity || 1),
      0,
    ) ||
      0);
  const computedDeliveryFee = fulfillmentMethod === "pickup" ? 0 : 200;
  const computedTotal = computedSubtotal + computedDeliveryFee;

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    handleCheckout({
      fulfillmentMethod,
      recipientName,
      phone,
      address: fulfillmentMethod === "delivery" ? address : "",
      city: fulfillmentMethod === "delivery" ? city : "",
      notes,
    });
  };

  if (!isCartOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeCart}
      />
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-500 ease-in-out">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-5 sm:px-6 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {step === "details" && (
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="mr-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Back to cart items"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                  {step === "details"
                    ? "Delivery & Pickup Details"
                    : "Shopping cart"}
                </h2>
              </div>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative -m-2 p-2 text-slate-400 hover:text-slate-500 cursor-pointer dark:hover:text-slate-300"
                  onClick={closeCart}
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close panel</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {cart?.products?.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4">
                  <ShoppingBag className="h-12 w-12 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Looks like you haven't added anything yet.
                  </p>
                  <Link
                    to="/store"
                    onClick={closeCart}
                    className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : step === "cart" ? (
                <ul role="list" className="-my-6 divide-y divide-slate-200 dark:divide-slate-800">
                  {cart?.products?.map((item) => (
                    <li key={item.productId?._id} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
                        <img
                          src={item.productId?.imageUrl}
                          alt={item.productId?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-slate-900 dark:text-white">
                            <h3>
                              <Link
                                to={`/store/product/${item.productId?._id}`}
                                onClick={closeCart}
                                className="cursor-pointer"
                              >
                                {item.productId?.name}
                              </Link>
                            </h3>
                            <p className="ml-4">Rs {item.productId?.price?.toLocaleString()}</p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {item.productId?.category}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                if (item.quantity <= 1) {
                                  removeItem(item.productId?._id);
                                } else {
                                  updateQuantity(
                                    item.productId?._id,
                                    item.quantity - 1,
                                  );
                                }
                              }}
                              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId?._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={item.quantity >= item.productId?.stock}
                              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId?._id)}
                              className="font-medium text-red-600 hover:text-red-500 cursor-pointer dark:text-red-500 dark:hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <form
                  id="checkout-fulfillment-form"
                  onSubmit={handleProceedToPayment}
                  className="space-y-5"
                >
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Fulfillment Method
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleFulfillmentChange("delivery")}
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          fulfillmentMethod === "delivery"
                            ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600 dark:border-brand-500 dark:bg-brand-950/40"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Truck
                            className={`h-5 w-5 ${
                              fulfillmentMethod === "delivery"
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-slate-400"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Rs. 200
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          Home Delivery
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Delivered to your door
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFulfillmentChange("pickup")}
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          fulfillmentMethod === "pickup"
                            ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600 dark:border-brand-500 dark:bg-brand-950/40"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Store
                            className={`h-5 w-5 ${
                              fulfillmentMethod === "pickup"
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-slate-400"
                            }`}
                          />
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            FREE
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          Gym Pickup
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Collect at front desk
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Recipient Full Name
                    </label>
                    <input
                      id="recipientName"
                      name="recipientName"
                      type="text"
                      autoComplete="name"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ahmed Khan"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Contact Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {fulfillmentMethod === "delivery" ? (
                    <>
                      <div>
                        <label
                          htmlFor="street-address"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Street Address
                        </label>
                        <textarea
                          id="street-address"
                          name="street-address"
                          rows={2}
                          autoComplete="street-address"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="House #, Street, Area / Sector"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          City
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Lahore"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            GymEase Front Desk Pickup
                          </p>
                          <p className="mt-0.5">
                            Your order will be prepared at the GymEase reception desk. Show your Order ID on your next gym visit to collect your items with zero delivery charges.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Order Notes{" "}
                      <span className="text-xs font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id="notes"
                      name="notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        fulfillmentMethod === "delivery"
                          ? "Gate code, landmark, or preferred time"
                          : "Preferred pickup time or note"
                      }
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </form>
              )}
            </div>
            {cart?.products?.length > 0 && checkoutData && (
              <div className="border-t border-slate-200 px-4 py-6 sm:px-6 dark:border-slate-800">
                <div className="flex justify-between text-base font-medium text-slate-900 mb-2 dark:text-white">
                  <p>Subtotal</p>
                  <p>Rs. {computedSubtotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mb-4 dark:text-slate-400">
                  <p>
                    {fulfillmentMethod === "pickup"
                      ? "Gym Pickup"
                      : "Delivery Fee"}
                  </p>
                  <p>
                    {computedDeliveryFee === 0
                      ? "Free"
                      : `Rs. ${computedDeliveryFee.toLocaleString()}`}
                  </p>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 mb-6 dark:text-white">
                  <p>Total</p>
                  <p>Rs. {computedTotal.toLocaleString()}</p>
                </div>
                <div className="mt-6">
                  {computedTotal > 100000 && (
                    <p className="text-sm text-red-600 mb-3 text-center dark:text-red-500">
                      Maximum order limit (Rs. 100,000) exceeded.
                    </p>
                  )}
                  {step === "cart" ? (
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      disabled={computedTotal > 100000}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="checkout-fulfillment-form"
                      disabled={loading || computedTotal > 100000}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        `Proceed to Payment (Rs. ${computedTotal.toLocaleString()})`
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-slate-500 dark:text-slate-400">
                  <p>
                    or{" "}
                    <Link
                      to="/store"
                      className="font-medium text-brand-600 hover:text-brand-500 cursor-pointer inline-flex items-center"
                      onClick={closeCart}
                    >
                      Continue Shopping
                      <span aria-hidden="true" className="ml-1"> &rarr;</span>
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
