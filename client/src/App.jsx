import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Layout/Navbar.jsx";
import Footer from "./components/Layout/Footer.jsx";
import CartDrawer from "./components/Store/CartDrawer.jsx";
import ChatWidget from "./components/Chat/ChatWidget.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";

function App() {
  const location = useLocation();
  const { user } = useAuth();
  const { hasActiveMembership } = useCart();
  
  const isDashboardRoute = 
    location.pathname.startsWith("/member") || 
    location.pathname.startsWith("/trainer") ||
    location.pathname.startsWith("/payment") ||
    (user?.role === "Member" && hasActiveMembership && location.pathname.startsWith("/store"));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {!isDashboardRoute && <Navbar />}
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isDashboardRoute && <Footer />}
      <ChatWidget />
    </div>
  );
}

export default App;
