import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Store", to: "/store" },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-20">

          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Dumbbell className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">GymEase</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              One app for memberships, training plans, progress tracking, and your gym store.
            </p>
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Navigate
            </p>
            <ul className="space-y-2.5 text-center lg:text-left">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Legal
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li className="flex flex-col gap-4">
                <a
                  href="https://mail.google.com/mail/u/0/?fs=1&to=gymease1@gmail.com&tf=cm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  gymease1@gmail.com
                </a>
                <a
                  href="tel:+923264713441"
                  className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  +92 3264713441
                </a>
                <a
                  href="tel:+923095458868"
                  className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  +92 3095458868
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
          &copy; {new Date().getFullYear()} GymEase. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
