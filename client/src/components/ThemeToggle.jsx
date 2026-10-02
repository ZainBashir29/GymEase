import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentIcon = () => {
    if (theme === "light") return <Sun size={18} className="text-slate-700 dark:text-slate-200" />;
    if (theme === "dark") return <Moon size={18} className="text-slate-700 dark:text-slate-200" />;
    return <Monitor size={18} className="text-slate-700 dark:text-slate-200" />;
  };

  const handleSelect = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
        title="Toggle Theme"
      >
        {getCurrentIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 z-50">
          <button
            onClick={() => handleSelect("light")}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              theme === "light"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <Sun size={16} />
            Light
          </button>
          <button
            onClick={() => handleSelect("dark")}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <Moon size={16} />
            Dark
          </button>
          <button
            onClick={() => handleSelect("system")}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              theme === "system"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <Monitor size={16} />
            System
          </button>
        </div>
      )}
    </div>
  );
}
