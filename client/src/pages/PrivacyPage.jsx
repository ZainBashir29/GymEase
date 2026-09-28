import { ArrowLeft, Database, Lock, ShieldCheck, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

const privacySections = [
  {
    icon: UserCog,
    title: "Information We Collect",
    description:
      "We collect the information required to provide a smooth gym management experience, including account details, membership information, contact information, workout progress, payment status, and communication history within the app.",
  },
  {
    icon: Database,
    title: "How We Use Your Data",
    description:
      "Your data is used to create and manage your account, process bookings and memberships, personalize workouts and trainer communication, support customer service, and maintain a secure and efficient platform experience.",
  },
  {
    icon: Lock,
    title: "Data Protection",
    description:
      "We use reasonable technical and organizational safeguards to help protect your personal information against loss, misuse, unauthorized access, and disclosure.",
  },
  {
    icon: ShieldCheck,
    title: "Sharing & Third Parties",
    description:
      "We do not sell personal data. We may share limited information with trusted service providers who assist with hosting, payment processing, analytics, or customer support, only as needed to operate the service.",
  },
];

const PrivacyPage = () => {
  return (
    <div className="bg-slate-50">
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
            This policy explains how we collect, use, protect, and handle your personal information when you use our application.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-600">
            Effective date: September 28, 2026
          </p>

          <div className="mt-6 space-y-6 text-slate-700">
            <p>
              GymEase respects your privacy and is committed to protecting personal information in a transparent, secure, and responsible way. This Privacy Policy applies to data collected through our mobile application and related services.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              {privacySections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-slate-900">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                  </div>
                );
              })}
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Your Rights</h2>
              <p className="mt-3">
                You may have rights to access, correct, or delete your personal information, depending on your location and applicable law. You may also choose to opt out of certain non-essential communications or manage notification preferences within the app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Cookies and Analytics</h2>
              <p className="mt-3">
                We may use cookies, device identifiers, and analytics tools to understand usage patterns, improve app performance, and maintain service quality. These tools help us monitor errors, improve user experience, and understand important app trends.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Children’s Privacy</h2>
              <p className="mt-3">
                Our services are intended for adults and users with appropriate legal consent. We do not knowingly collect personal information from children under the age of 13 without verified parental consent where required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Contact Us</h2>
              <p className="mt-3">
                If you have any questions about this Privacy Policy or how your data is handled, please contact us at
                <a href="mailto:hello@gym-ease.com" className="ml-1 font-medium text-brand-700 underline underline-offset-4">
                  hello@gym-ease.com
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
