import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Loader2,
  PackageSearch,
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  Package,
  Settings,
} from "lucide-react";
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

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, itemCount, toggleCart } = useCart();
  const { user } = useAuth();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/store/products");
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const content = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
    </div>
  ) : (
    <div className={`mx-auto max-w-7xl ${user?.role === "Member" ? "mb-8" : "px-4 py-16 sm:px-6 lg:px-8 lg:py-24"}`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          GymEase Store
        </h2>
        {user?.role === "Member" && (
          <button
            onClick={toggleCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <PackageSearch className="h-10 w-10 text-brand-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            No Products Found
          </h3>
          <p className="text-slate-500 max-w-md text-center">
            We are currently out of stock. Please check back later.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => {
            const cartItem = cart?.products?.find(
              (item) => item.productId?._id === product._id || item.productId === product._id
            );
            const inCartQuantity = cartItem?.quantity || 0;

            return (
            <div key={product._id}>
              <Link to={`/store/product/${product._id}`}>
                <div className="relative group cursor-pointer h-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-300">
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getProductImageSrc(product)}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out opacity-0 transition-opacity duration-300"
                      onLoad={(e) => e.target.classList.remove("opacity-0")}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder-product.svg";
                        e.target.classList.remove("opacity-0");
                      }}
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        Only {product.stock} left!
                      </div>
                    )}
                    {inCartQuantity > 0 && (
                      <div className="absolute top-3 right-3 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-800">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {inCartQuantity} in cart
                      </div>
                    )}
                  </div>
                  <div className="relative p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>
                    <p className="mt-4 text-xl font-black text-brand-600">
                      Rs. {product.price.toLocaleString()}
                    </p>
                    <div
                      className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                        product.stock === 0
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : inCartQuantity > 0
                          ? "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock === 0
                        ? "Out of Stock"
                        : inCartQuantity > 0
                        ? "Add Another"
                        : "Add to Cart"}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )})}
        </div>
      )}
    </div>
  );

  if (user?.role === "Member") {
    return (
      <DashboardLayout navItems={memberSidebarItems}>{content}</DashboardLayout>
    );
  }

  return content;
};

export default StorePage;
