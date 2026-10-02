import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, navItems }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative dark:bg-slate-950">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          navItems={navItems}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden shrink-0 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-lg font-bold text-slate-900 dark:text-white">GymEase</span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
