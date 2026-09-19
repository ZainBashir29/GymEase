import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, ShoppingCart, Minus, Plus, LayoutDashboard, Dumbbell, CreditCard, ShoppingBag, Package, Settings } from "lucide-react";
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

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, itemCount, toggleCart } = useCart();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);

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
      window.location.href = "/login";
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const content = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
    </div>
  ) : !product ? (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <p className="text-lg font-medium text-slate-900">Product not found</p>
      <Link to="/store" className="text-brand-600 hover:underline">
        Back to store
      </Link>
    </div>
  ) : (
    <>
      <div className={`mx-auto max-w-2xl ${user?.role === "Member" ? "mb-8 lg:mt-4" : "px-4 py-16 sm:px-6 sm:py-24"} lg:max-w-7xl lg:px-8`}>
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
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
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <div className="flex flex-col-reverse">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-slate-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover object-center opacity-0 transition-opacity duration-300"
                onLoad={(e) => e.target.classList.remove('opacity-0')}
              />
            </div>
          </div>
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {product.name}
            </h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-slate-900">
                Rs. {product.price.toLocaleString()}
              </p>
            </div>
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-slate-700">
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
            <div className="mt-10 flex">
              <div className="mr-4 flex items-center border border-slate-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 cursor-pointer"
                  disabled={product.stock === 0}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 cursor-pointer"
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
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (user?.role === "Member") {
    return (
      <DashboardLayout navItems={memberSidebarItems}>
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div className="bg-white">
      {content}
    </div>
  );
};

export default ProductDetailsPage;
