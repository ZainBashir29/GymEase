import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Loader2, PackageSearch } from "lucide-react";
import api from "../../lib/axios.js";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

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
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="md:flex md:items-center md:justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          GymEase Store
        </h2>
      </div>
      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center space-y-4">
          <PackageSearch className="h-16 w-16 text-slate-300" />
          <h3 className="text-xl font-medium text-slate-900">
            No products found
          </h3>
          <p className="text-slate-500">
            Check back later for new gear and supplements.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="group relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <Link to={`/store/product/${product._id}`} className="flex flex-col h-full">
                <div className="aspect-square w-full overflow-hidden bg-slate-200 lg:h-80 lg:aspect-auto">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="text-sm text-slate-700 font-medium line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {product.category}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    Rs {product.price}
                  </p>

                  <div className="mt-auto pt-4">
                    <button
                      onClick={(e) = className="cursor-pointer"> handleAddToCart(e, product._id)}
                      disabled={
                        addingToCart === product._id || product.stock === 0
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-70"
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
};

export default StorePage;
