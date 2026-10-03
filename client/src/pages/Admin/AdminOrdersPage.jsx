import { useAuth } from "../../context/AuthContext.jsx";
import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Package,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  X,
  ShoppingBag, ShieldAlert } from "lucide-react";

const AdminOrdersPage = () => {
  
  const { hasPermission } = useAuth();
  if (!hasPermission("manage_orders")) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center p-8">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/store/orders");
      setOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/store/orders/update-status/${orderId}`, {
        orderStatus: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o,
        ),
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (error) {
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?"))
      return;
    try {
      await api.delete(`/store/orders/delete/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
      case "Paid":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
      case "Processing":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
      case "failed":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
      case "refunded":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.memberId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.memberId?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Manage and track member store orders.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden dark:bg-slate-900 dark:ring-slate-800">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-transparent text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Items
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Payment
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const totalPcs =
                    order.products?.reduce(
                      (sum, p) => sum + (p.quantity || 1),
                      0,
                    ) ||
                    order.products?.length ||
                    0;
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                            {order._id.substring(order._id.length - 8)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {order.memberId?.fullName || "Unknown User"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {order.memberId?.email || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-100 cursor-pointer dark:text-brand-400 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 dark:border-brand-800/50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {totalPcs} pcs ({order.products?.length || 0} items)
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Rs. {order.totalAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {order.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            title="View Items & Details"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-brand-900/30"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Delete Order"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="relative inline-block text-left">
                            <select
                              disabled={updatingId === order._id}
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className={`appearance-none bg-white border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs font-medium cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-white ${updatingId === order._id ? "opacity-50" : ""}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Processing">Processing</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 dark:text-white">
                  <Package className="w-5 h-5 text-brand-600" />
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 dark:text-slate-400">
                  ID: {selectedOrder._id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1 dark:bg-slate-800/50 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                    Customer Details
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedOrder.memberId?.fullName || "Unknown Member"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {selectedOrder.memberId?.email || "No email available"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 dark:bg-slate-800/50 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                    Order & Payment Status
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedOrder.orderStatus)}`}
                    >
                      Order: {selectedOrder.orderStatus}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                    >
                      Payment: {selectedOrder.paymentStatus || "pending"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between dark:text-white">
                  <span>Ordered Items</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {selectedOrder.products?.length || 0} item type/s
                  </span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 dark:border-slate-700 dark:divide-slate-700">
                  {selectedOrder.products &&
                  selectedOrder.products.length > 0 ? (
                    selectedOrder.products.map((item, idx) => {
                      const product = item.productId;
                      const name = product?.name || "Product Item";
                      const price = product?.price || 0;
                      const qty = item.quantity || 1;
                      const lineTotal = price * qty;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center dark:bg-slate-800 dark:border-slate-700">
                              {product?.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={name}
                                  className="w-full h-full object-cover object-center"
                                />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate dark:text-white">
                                {name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {product?.category && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                    {product.category}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Rs. {price.toLocaleString()} x {qty}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              Rs. {lineTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      No items recorded for this order.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-sm dark:bg-slate-800/50 dark:border-slate-700">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Items Subtotal</span>
                  <span>
                    Rs.{" "}
                    {(
                      selectedOrder.products?.reduce(
                        (sum, i) =>
                          sum + (i.productId?.price || 0) * (i.quantity || 1),
                        0,
                      ) || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery Fee</span>
                  <span>Rs. 200</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-brand-600">
                    Rs. {selectedOrder.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap dark:text-slate-400">
                  Update Status:
                </span>
                <select
                  disabled={updatingId === selectedOrder._id}
                  value={selectedOrder.orderStatus}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder._id, e.target.value)
                  }
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  title="Delete Order"
                  className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
