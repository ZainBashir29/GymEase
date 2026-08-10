import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const TRUST_POINTS = [
  "No setup fees",
  "Cancel anytime",
  "Real trainers, real plans",
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
          Everything your gym needs, one place
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Manage your fitness journey,{" "}
          <span className="text-brand-600">effortlessly</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          GymEase brings memberships, personalized training plans, progress
          tracking, and your gym store together — so you can focus on showing
          up, not managing paperwork.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30"
          >
            Start your membership
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            View pricing
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point}
              className="flex items-center gap-2 text-sm text-slate-500"
            >
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
