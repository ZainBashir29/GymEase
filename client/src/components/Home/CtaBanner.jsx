import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CtaBanner = () => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand-700/40 blur-3xl"
          />

          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-50">
            Join GymEase today and take the guesswork out of your fitness
            routine.
          </p>
          <Link
            to="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:scale-[1.02]"
          >
            Join Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
