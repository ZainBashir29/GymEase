import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CtaBanner = () => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-400 via-brand-600 to-brand-800 px-8 py-16 text-center shadow-xl sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Join GymEase today and take the guesswork out of your fitness
            routine.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-md transition-all hover:bg-brand-50 hover:shadow-lg"
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
