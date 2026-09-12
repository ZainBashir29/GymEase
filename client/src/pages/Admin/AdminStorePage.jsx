import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Plus, Trash2, Package, X, Image as ImageIcon, Edit2 } from "lucide-react";

const AdminStorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Supplement",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/store/products?includeInactive=true");
      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await api.delete(`/store/products/delete/${id}`);
      fetchProducts();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({ name: "", description: "", price: "", stock: "", category: "Supplement" });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category || "Supplement",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingProductId && !imageFile) {
      alert("Please select a product image");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => form.append(key, formData[key]));
      if (imageFile) {
        form.append("image", imageFile);
      }

      if (editingProductId) {
        await api.patch(`/store/products/update/${editingProductId}`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/store/products/add", form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      setIsModalOpen(false);
      setEditingProductId(null);
      setFormData({ name: "", description: "", price: "", stock: "", category: "Supplement" });
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || (editingProductId ? "Failed to update product" : "Failed to add product"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Store Products</h1>
          <p className="text-slate-500 mt-1">Manage e-commerce products and inventory.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm">
            <p className="text-slate-500">No products available in the store.</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100 flex flex-col group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {!product.isActive && (
                  <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                    INACTIVE
                  </div>
                )}
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 line-clamp-1 flex-1">{product.name}</h3>
                  <span className="font-black text-brand-600 ml-2">Rs {product.price}</span>
                </div>
                
                <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">
                  {product.category} • Stock: {product.stock}
                </p>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {product.isActive && (
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProductId ? "Edit Product" : "Add New Product"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Whey Protein Isolate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Product details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rs)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Supplement">Supplement</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Accessory">Accessory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Image {editingProductId && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={!editingProductId}
                  />
                  <div className="space-y-1 text-center">
                    {imageFile ? (
                      <div className="text-brand-600 font-medium break-all">
                        {imageFile.name}
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                          <span className="relative cursor-pointer rounded-md bg-transparent font-medium text-brand-600 focus-within:outline-none hover:text-brand-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2 z-10">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingProductId ? 'Saving Changes...' : 'Adding Product...'}
                    </>
                  ) : (
                    editingProductId ? 'Save Changes' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStorePage;
