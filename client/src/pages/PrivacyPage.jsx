import { useEffect } from "react";
import { ArrowLeft, Database, Lock, ShieldCheck, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

const privacySections = [
  {
    icon: UserCog,
    title: "Information We Collect",
    description:
      "We collect the fundamental data required to demonstrate the application's core features. This includes your basic account details, gym plan selections, and internal chat communications.",
  },
  {
    icon: Database,
    title: "How We Use Your Data",
    description:
      "Your data is used strictly to operate the platform and fulfill the project's functional requirements, such as managing role-based dashboards, rendering workout plans, and tracking test memberships.",
  },
  {
    icon: Lock,
    title: "Security Measures",
    description:
      "Although this is an academic project, we adhere to standard software engineering security practices. Passwords are cryptographically hashed before storage, and sessions are secured using JWTs.",
  },
  {
    icon: ShieldCheck,
    title: "Third-Party Services",
    description:
      "We do not sell or distribute personal data. We only utilize standard third-party infrastructure required to host the application, manage the database, and process simulated payments.",
  },
];

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            GymEase
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
            This document outlines how data is handled within the GymEase platform, developed as an academic software engineering project.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Effective date: September 28, 2026
          </p>

          <div className="mt-6 space-y-6 text-slate-700 dark:text-slate-300">
            <p>
              Welcome to GymEase. Please note that this platform is a university project developed for academic evaluation. We take software engineering standards seriously and have outlined how we collect, store, and manage your test data below.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              {privacySections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:bg-slate-800/50 dark:border-slate-700">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{section.description}</p>
                  </div>
                );
              })}
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Data Control</h2>
              <p className="mt-3">
                You retain full control over any information you submit to the platform. If you wish to have your test account or associated data removed from our database, please contact the system administrator.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Cookies</h2>
              <p className="mt-3">
                GymEase uses essential, HTTP-only cookies strictly for managing secure user sessions and maintaining your logged-in state across the application. We do not implement tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Contact Information</h2>
              <p className="mt-3">
                If you are evaluating this project or have any technical questions regarding the system's architecture and data handling, please reach out to the developer at
                <a href="mailto:gymease1@gmail.com" className="ml-1 font-medium text-brand-700 underline underline-offset-4 dark:text-brand-400">
                  gymease1@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPage;
