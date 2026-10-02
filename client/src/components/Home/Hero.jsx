import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Dumbbell, TrendingUp, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const trustPoints = [
  "No setup fees",
  "Cancel anytime",
  "Real trainers, real plans",
];

const MembershipCardMockup = () => (
  <div
    className="relative overflow-hidden rounded-xl text-white shadow-2xl p-6"
    style={{
      background: "linear-gradient(to bottom right, #059669, #065f46)",
      boxShadow: "0 32px 64px -12px rgba(6,95,70,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset",
    }}
  >
    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/10 blur-xl" />

    <div className="relative z-10 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 opacity-90">
          <Dumbbell className="h-5 w-5 shrink-0" strokeWidth={2.5} />
          <span className="text-sm font-bold tracking-tight">GymEase</span>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200">
            Member
          </p>
          <p className="text-lg font-bold leading-tight">Bilal Ahmad</p>
        </div>

        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200">
              Plan
            </p>
            <p className="text-sm font-semibold">Standard</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200">
              Valid Thru
            </p>
            <p className="text-sm font-semibold">7  Nov 2026</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
        <QRCodeSVG
          value="https://gymease.app/verify/demo-member-id"
          size={70}
          level="M"
          includeMargin={false}
          className="rounded-sm"
        />
      </div>
    </div>
  </div>
);

const AttendanceWidget = () => (
  <div
    className="widget-float-b absolute -bottom-5 left-0 z-20 w-44 rounded-2xl border border-slate-100/80 bg-white p-4 dark:bg-slate-900 dark:border-slate-800"
    style={{ boxShadow: "0 16px 40px -8px rgba(15,23,42,0.14), 0 0 0 1px rgba(15,23,42,0.04)" }}
  >
    <div className="mb-3 flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50">
        <TrendingUp className="h-4 w-4 text-brand-600" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400">Attendance</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">This Month</p>
      </div>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-brand-600 transition-all"
        style={{ width: "84%" }}
      />
    </div>
    <div className="mt-1.5 flex items-center justify-between">
      <div className="flex gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Check className="h-3 w-3 text-brand-600" /> <span className="text-brand-600 font-semibold">16</span> sessions
        </div>
      </div>
      <span className="text-xs font-bold text-brand-600">84%</span>
    </div>
  </div>
);

const NextSessionWidget = () => (
  <div
    className="widget-float-a absolute -top-5 right-0 z-20 w-44 rounded-2xl border border-slate-100/80 bg-white p-4 dark:bg-slate-900 dark:border-slate-800"
    style={{ boxShadow: "0 16px 40px -8px rgba(15,23,42,0.14), 0 0 0 1px rgba(15,23,42,0.04)" }}
  >
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
        <Dumbbell className="h-4 w-4 text-brand-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400">Next Session</p>
        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">Upper Body</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400">Today 6:00 PM</span>
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
        <div className="flex items-center gap-1"><Check className="h-3 w-3" /> Set</div>
      </span>
    </div>
  </div>
);

const Hero = () => {
  return (
    <>
      <style>{`
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes widget-float-a {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes widget-float-b {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes fade-up-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes fade-right-in {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0px); }
        }
        .hero-card-float { animation: hero-float     7s ease-in-out infinite; }
        .widget-float-a  { animation: widget-float-a  5s ease-in-out infinite; }
        .widget-float-b  { animation: widget-float-b  6s ease-in-out 1.2s infinite; }
        .anim-0 { animation: fade-up-in    0.6s ease-out 0.00s both; }
        .anim-1 { animation: fade-up-in    0.6s ease-out 0.10s both; }
        .anim-2 { animation: fade-up-in    0.6s ease-out 0.20s both; }
        .anim-3 { animation: fade-up-in    0.6s ease-out 0.32s both; }
        .anim-4 { animation: fade-up-in    0.6s ease-out 0.46s both; }
        .anim-r { animation: fade-right-in 0.8s ease-out 0.30s both; }
        .btn-primary {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -4px rgba(5,150,105,0.38);
        }
        .btn-secondary {
          transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
        }
        .btn-secondary:hover { transform: translateY(-2px); }
      `}</style>

      <section className="relative overflow-hidden bg-white dark:bg-slate-950">

        {/* Dot-grid background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient glow orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.22), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.14), transparent)" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 sm:pt-16 sm:pb-32">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center xl:gap-24">

            <div className="flex-[1.1] w-full lg:pl-8">

              <div className="anim-0 mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
                Everything your gym needs, one place
              </div>

              <h1 className="anim-1 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.5rem] xl:leading-[1.1] dark:text-white">
                Manage your fitness{" "}
                <br className="hidden sm:block" />
                journey,{" "}
                <span className="relative inline-block text-brand-600">
                  effortlessly
                  <svg
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 w-full"
                    viewBox="0 0 220 8"
                    fill="none"
                  >
                    <path
                      d="M2 6 Q55 2 110 5 Q165 8 218 4"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.45"
                    />
                  </svg>
                </span>
              </h1>

              <p className="anim-2 mt-6 text-lg leading-8 text-slate-500 dark:text-slate-400">
                GymEase brings memberships, personalized training plans, progress
                tracking, and your gym store together — so you can focus on your
                progress, not the paperwork.
              </p>

              <div className="anim-3 mt-10 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/20"
                >
                  Start your membership
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="btn-secondary inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700"
                >
                  View pricing
                </Link>
              </div>

              <div className="anim-4 mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="anim-r relative flex flex-1 items-center justify-center py-20 lg:pr-20">

              <div className="hero-card-float relative z-10 w-full max-w-sm">
                <MembershipCardMockup />
              </div>

              <NextSessionWidget />

              <AttendanceWidget />

              <div
                aria-hidden="true"
                className="absolute inset-x-10 bottom-10 h-10 rounded-full blur-2xl"
                style={{ background: "rgba(5,150,105,0.18)" }}
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;

// import { Link } from "react-router-dom";
// import { ArrowRight, CheckCircle2 } from "lucide-react";

// const trustPoints = [
//   "No setup fees",
//   "Cancel anytime",
//   "Real trainers, real plans",
// ];

// const Hero = () => {
//   return (
//     <section className="relative overflow-hidden bg-white">
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 rounded-full bg-brand-400/40 blur-3xl"
//       />

//       <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
//         <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
//           <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
//           Everything your gym needs, one place
//         </div>

//         <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
//           Manage your fitness journey,{" "}
//           <span className="text-brand-600">effortlessly</span>
//         </h1>

//         <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
//           GymEase brings memberships, personalized training plans, progress
//           tracking, and your gym store together so you can focus on your
//           progress, not the manual work around it.
//         </p>

//         <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
//           <Link
//             to="/register"
//             className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30"
//           >
//             Start your membership
//             <ArrowRight className="h-4 w-4" />
//           </Link>
//           <Link
//             to="/pricing"
//             className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
//           >
//             View pricing
//           </Link>
//         </div>

//         <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
//           {trustPoints.map((point) => (
//             <div
//               key={point}
//               className="flex items-center gap-2 text-sm text-slate-500"
//             >
//               <CheckCircle2 className="h-4 w-4 text-brand-600" />
//               {point}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
