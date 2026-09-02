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
} from "lucide-react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import api from "../../lib/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const MEMBER_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/member/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "My Plan", to: "/member/plans", icon: Dumbbell },
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
        return "bg-yellow-100 text-yellow-800";
      case "Paid":
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <DashboardLayout navItems={MEMBER_NAV_ITEMS}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your order history and current placed orders.
        </p>
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            No orders found
          </h3>
          <p className="mt-2 text-slate-500">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col border-b border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Order ID:{" "}
                    <span className="font-mono text-slate-600">
                      {order._id}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-4 sm:mt-0">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    Rs {order.totalAmount}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <ul role="list" className="divide-y divide-slate-100">
                  {order.products.map((item, index) => (
                    <li key={index} className="flex py-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                        <img
                          src={item.productId?.imageUrl}
                          alt={item.productId?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col justify-center">
                        <div>
                          <div className="flex justify-between text-base font-medium text-slate-900">
                            <h3>{item.productId?.name}</h3>
                            <p className="ml-4">Rs {item.productId?.price}</p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
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
    </DashboardLayout>
  );
};
export default MemberOrdersPage;
