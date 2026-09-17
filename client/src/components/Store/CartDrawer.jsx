import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "../../context/CartContext.jsx";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    checkoutData,
    handleCheckout,
    loading,
  } = useCart();

  if (!isCartOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeCart}
      />
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-500 ease-in-out">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-slate-900">
                Shopping cart
              </h2>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative -m-2 p-2 text-slate-400 hover:text-slate-500 cursor-pointer"
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
                  <p className="text-lg font-medium text-slate-900">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-slate-500">
                    Looks like you haven't added anything yet.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul role="list" className="-my-6 divide-y divide-slate-200">
                  {cart?.products?.map((item) => (
                    <li key={item.productId?._id} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                        <img
                          src={item.productId?.imageUrl}
                          alt={item.productId?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-slate-900">
                            <h3>
                              <Link
                                to={`/store/product/${item.productId?._id}`}
                                onClick={closeCart}
                                className="cursor-pointer"
                              >
                                {item.productId?.name}
                              </Link>
                            </h3>
                            <p className="ml-4">Rs {item.productId?.price}</p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.productId?.category}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId?._id,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-slate-900">
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
                              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId?._id)}
                              className="font-medium text-red-600 hover:text-red-500 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cart?.products?.length > 0 && checkoutData && (
              <div className="border-t border-slate-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-slate-900 mb-2">
                  <p>Subtotal</p>
                  <p>Rs {checkoutData.subtotal}</p>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mb-4">
                  <p>Delivery Fee</p>
                  <p>Rs {checkoutData.deliveryFee}</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                  <p>Total</p>
                  <p>Rs {checkoutData.totalAmount}</p>
                </div>
                <div className="mt-6">
                  {checkoutData.totalAmount > 100000 && (
                    <p className="text-sm text-red-600 mb-3 text-center">
                      Maximum order limit (Rs. 100,000) exceeded.
                    </p>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={loading || checkoutData.totalAmount > 100000}
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Checkout via Safepay"
                    )}
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-slate-500">
                  <p>
                    or{" "}
                    <button
                      type="button"
                      className="font-medium text-brand-600 hover:text-brand-500 cursor-pointer"
                      onClick={closeCart}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
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
