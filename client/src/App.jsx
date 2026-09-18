import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Layout/Navbar.jsx";
import Footer from "./components/Layout/Footer.jsx";
import CartDrawer from "./components/Store/CartDrawer.jsx";
import ChatWidget from "./components/Chat/ChatWidget.jsx";

function App() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/member") || location.pathname.startsWith("/trainer");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
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
