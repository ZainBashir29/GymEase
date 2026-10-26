import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  MessageCircle,
  Package,
  Loader2,
  Settings,
  Truck,
  Store,
  MapPin,
} from "lucide-react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import api from "../../lib/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const memberNavbarItems = [
  {
    label: "Dashboard",
    to: "/member/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "Gym Plans", to: "/member/plans", icon: Dumbbell },
  { label: "Membership", to: "/member/membership", icon: CreditCard },
  { label: "Store", to: "/store", icon: ShoppingBag },
  { label: "Orders", to: "/member/orders", icon: Package },
  { label: "Settings", to: "/member/settings", icon: Settings },
];

const MemberOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/store/orders/me");
        setOrders(data.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
      case "Processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Paid":
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View your order history and current placed orders.
        </p>
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
            No orders found
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex flex-col border-b border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800/50 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Order ID:{" "}
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      {order._id}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      order.fulfillmentMethod === "pickup"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                    }`}
                  >
                    {order.fulfillmentMethod === "pickup" ? (
                      <>
                        <Store className="h-3.5 w-3.5" /> Gym Pickup (Free)
                      </>
                    ) : (
                      <>
                        <Truck className="h-3.5 w-3.5" /> Home Delivery
                      </>
                    )}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    Rs. {order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="border-b border-slate-100 bg-slate-50/40 px-6 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                    {order.fulfillmentMethod === "pickup"
                      ? "Collect at GymEase Front Desk"
                      : [
                          order.shippingDetails?.address,
                          order.shippingDetails?.city,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Home Delivery"}
                  </span>
                  {order.shippingDetails?.phone && (
                    <span>Phone: {order.shippingDetails.phone}</span>
                  )}
                  {order.shippingDetails?.notes && (
                    <span className="italic">
                      Note: &ldquo;{order.shippingDetails.notes}&rdquo;
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <ul role="list" className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.products.map((item, index) => (
                    <li key={index} className="flex py-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                        <img
                          src={item.productId?.imageUrl}
                          alt={item.productId?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col justify-center">
                        <div>
                          <div className="flex justify-between text-base font-medium text-slate-900 dark:text-white">
                            <h3>{item.productId?.name}</h3>
                            <p className="ml-4">
                              Rs. {item.productId?.price?.toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
export default MemberOrdersPage;
