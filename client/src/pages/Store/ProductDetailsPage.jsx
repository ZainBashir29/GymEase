import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, ArrowLeft, ShoppingCart, Minus, Plus, Lock, Sparkles, LayoutDashboard, Dumbbell, CreditCard, ShoppingBag, Package, Settings } from "lucide-react";
import api from "../../lib/axios.js";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";

const memberSidebarItems = [
  { label: "Dashboard", to: "/member/dashboard", icon: LayoutDashboard },
  { label: "Gym Plans", to: "/member/plans", icon: Dumbbell },
  { label: "Membership", to: "/member/membership", icon: CreditCard },
  { label: "Store", to: "/store", icon: ShoppingBag },
  { label: "Orders", to: "/member/orders", icon: Package },
  { label: "Settings", to: "/member/settings", icon: Settings },
];

const getProductImageSrc = (product) => {
  const imageUrl = product?.imageUrl?.trim();

  if (!imageUrl) return "/images/placeholder-product.svg";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.toLowerCase().endsWith(".webp")) return imageUrl;

  return imageUrl.replace(/\.(jpe?g|png|gif|bmp|svg)$/i, ".webp");
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const {
    cart,
    addToCart,
    updateQuantity,
    itemCount,
    toggleCart,
    hasActiveMembership,
    checkingMembership,
  } = useCart();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);

  const cartItem = cart?.products?.find(
    (item) => item.productId?._id === id || item.productId === id
  );

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/store/products/${id}`);
        setProduct(data.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { redirectTo: location.pathname } });
      return;
    }
    try {
      setAddingToCart(true);
      if (cartItem) {
        await updateQuantity(product._id, quantity);
      } else {
        await addToCart(product._id, quantity);
      }
    } catch (error) {
      alert(error.response?.data?.message || (cartItem ? "Failed to update cart" : "Failed to add to cart"));
    } finally {
      setAddingToCart(false);
    }
  };

  const isMemberWithSidebar = user?.role === "Member" && hasActiveMembership;

  const content = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
    </div>
  ) : !product ? (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <p className="text-lg font-medium text-slate-900 dark:text-white">Product not found</p>
      <Link to="/store" className="text-brand-600 hover:underline dark:text-brand-400">
        Back to store
      </Link>
    </div>
  ) : (
    <>
      <div className={`mx-auto max-w-2xl ${isMemberWithSidebar ? "mb-8 lg:mt-4" : "px-4 py-16 sm:px-6 sm:py-24"} lg:max-w-7xl lg:px-8`}>
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
          {user?.role === "Member" && hasActiveMembership && (
            <button
              onClick={toggleCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <div className="flex flex-col-reverse">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              <img
                src={getProductImageSrc(product)}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover object-center opacity-0 transition-opacity duration-300"
                onLoad={(e) => e.target.classList.remove('opacity-0')}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder-product.svg";
                  e.target.classList.remove('opacity-0');
                }}
              />
            </div>
          </div>
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-slate-900 dark:text-white">
                Rs. {product.price.toLocaleString()}
              </p>
            </div>
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-slate-700 dark:text-slate-300">
                <p>{product.description}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <p
                className={`text-sm font-medium ${
                  product.stock === 0
                    ? "text-red-600"
                    : product.stock <= 10
                      ? "text-orange-600"
                      : "text-emerald-600"
                }`}
              >
                {product.stock === 0
                  ? "Out of stock"
                  : product.stock <= 10
                    ? `Only ${product.stock} left in stock!`
                    : "In Stock"}
              </p>
            </div>
            <div className="mt-10">
              {!user ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Members-Only Store Benefit
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Purchasing supplements, gear, and accessories is an exclusive perk for active GymEase members.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/login", {
                          state: { redirectTo: location.pathname },
                        })
                      }
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors cursor-pointer"
                    >
                      Log in to Purchase
                    </button>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      View Membership Plans
                    </Link>
                  </div>
                </div>
              ) : user.role === "Member" && checkingMembership ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  <span>Checking membership eligibility...</span>
                </div>
              ) : user.role === "Member" && !hasActiveMembership ? (
                <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900/50 dark:bg-brand-950/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Unlock Exclusive Store Access
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        Store shopping is included as a member benefit across all active GymEase membership plans. Activate your membership to order this item.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/pricing"
                      className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                    >
                      Unlock Store Access — View Membership Plans
                    </Link>
                  </div>
                </div>
              ) : user.role !== "Member" ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Store purchasing is available exclusively for active GymEase members (Staff View).
                </div>
              ) : (
                <div className="flex">
                  <div className="mr-4 flex items-center border border-slate-300 rounded-lg dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-slate-500 hover:text-slate-700 cursor-pointer dark:text-slate-400 dark:hover:text-slate-300"
                      disabled={product.stock === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="px-4 py-2 text-slate-500 hover:text-slate-700 cursor-pointer dark:text-slate-400 dark:hover:text-slate-300"
                      disabled={product.stock === 0 || quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                    className="flex max-w-xs flex-1 items-center justify-center rounded-lg bg-brand-600 px-8 py-3 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-50 sm:w-full disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {addingToCart ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-5 w-5" />
                    )}
                    {cartItem ? "Update Cart" : "Add to cart"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isMemberWithSidebar) {
    return (
      <DashboardLayout navItems={memberSidebarItems}>
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950">
      {content}
    </div>
  );
};

export default ProductDetailsPage;
