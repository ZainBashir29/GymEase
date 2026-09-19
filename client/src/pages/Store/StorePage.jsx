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

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(null);
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

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const content = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
    </div>
  ) : (
    <div className={`mx-auto max-w-7xl ${user?.role === "Member" ? "mb-8" : "px-4 py-16 sm:px-6 lg:px-8 lg:py-24"}`}>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          GymEase Store
        </h2>
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
          {products.map((product) => (
            <div key={product._id}>
              <Link to={`/store/product/${product._id}`}>
                <div className="relative group cursor-pointer h-full flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-300">
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out opacity-0 transition-opacity duration-300"
                      onLoad={(e) => e.target.classList.remove("opacity-0")}
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        Only {product.stock} left!
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
                    <button
                      onClick={(e) => handleAddToCart(e, product._id)}
                      disabled={
                        product.stock === 0 || addingToCart === product._id
                      }
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                    >
                      {addingToCart === product._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
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
