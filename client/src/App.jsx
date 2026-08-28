import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Layout/Navbar.jsx";
import Footer from "./components/Layout/Footer.jsx";
import CartDrawer from "./components/Store/CartDrawer.jsx";
import ChatWidget from "./components/Chat/ChatWidget.jsx";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;
