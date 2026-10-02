import { Users, Dumbbell, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import aboutGymImage from "../assets/about-gym.jpg";

const stats = [
  { value: "3", label: "User Roles", sub: "Member, Trainer, Admin" },
  { value: "19", label: "Database Models", sub: "Mongoose schemas and relationships" },
  { value: "30+", label: "Screens", sub: "Across all three role portals" },
];

const values = [
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
      "Fitness is about people. We build tools that foster stronger relationships between gym admins, trainers, and their members.",
  },
  {
    icon: Dumbbell,
    title: "Strength in Simplicity",
    description:
      "Complex operations should not require complex software. We prioritize clean, user-friendly interfaces that anyone can master in minutes.",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url(${aboutGymImage})`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Our Mission at GymEase
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              We are redefining gym management by mixing technology with the
              passion of fitness: empowering admins, trainers, and members to
              achieve more together.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-slate-50 py-12 dark:bg-slate-950 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            {stats.map(({ value, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <dt className="text-5xl font-extrabold tracking-tight text-brand-600 dark:text-brand-500">
                  {value}
                </dt>
                <dd className="text-base font-semibold text-slate-800 dark:text-slate-100">{label}</dd>
                <dd className="text-sm text-slate-500 dark:text-slate-400">{sub}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-24 sm:py-32 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              What Drives Us
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Our core values shape everything we build, ensuring that GymEase
              remains the most reliable partner for your fitness journey.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      {item.title}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                      <p className="flex-auto">{item.description}</p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-20 dark:bg-slate-950 dark:border-slate-800">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-500">
            Final Year Project
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Built from the ground up
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">
            GymEase is a full-stack capstone project covering role-based access
            control, real-time chat, integrated payments, QR-based attendance,
            and a full gym store all in one platform.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30"
          >
            Start your membership
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
