import React from "react";
import { Users, Dumbbell, Target } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Innovation First",
    description:
      "We constantly push the boundaries of what a gym management system can do, bringing you features that save time and increase revenue.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Fitness is about people. We build tools that foster stronger relationships between gym owners, trainers, and their members.",
  },
  {
    icon: Dumbbell,
    title: "Strength in Simplicity",
    description:
      "Complex operations shouldn't require complex software. We prioritize clean, intuitive interfaces that anyone can master in minutes.",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
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
              {VALUES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                        <Icon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </div>
                      {item.title}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">{item.description}</p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
