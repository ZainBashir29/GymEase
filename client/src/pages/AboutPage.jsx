import React from "react";
import { Users, Dumbbell, Target } from "lucide-react";
const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Our Mission at GymEase
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              We're redefining gym management by blending cutting-edge
              technology with the passion of fitness. Empowering owners,
              trainers, and members to achieve more together.
            </p>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What Drives Us
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Our core values shape everything we build, ensuring that GymEase
              remains the most reliable partner for your fitness business.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <Target className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Innovation First
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    We constantly push the boundaries of what a gym management
                    system can do, bringing you features that save time and
                    increase revenue.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Community Driven
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    Fitness is about people. We build tools that foster stronger
                    relationships between gym owners, trainers, and their
                    members.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <Dumbbell
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  Strength in Simplicity
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    Complex operations shouldn't require complex software. We
                    prioritize clean, intuitive interfaces that anyone can
                    master in minutes.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};
export default AboutPage;
