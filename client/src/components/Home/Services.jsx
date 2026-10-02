import {
  Dumbbell,
  CreditCard,
  ShoppingBag,
  LineChart,
  MessageCircle,
  ScanLine,
} from "lucide-react";

const servicesPoints = [
  {
    icon: Dumbbell,
    title: "Personalized Plans",
    description:
      "Pick a proven gym plan or answer a few questions and get one built around your goals.",
  },
  {
    icon: CreditCard,
    title: "Simple Memberships",
    description:
      "Choose a membership plan, pay securely and get a digital membership card with a scannable QR code.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "See your sessions, attendance and progress at a glance.",
  },
  {
    icon: MessageCircle,
    title: "Chat with Trainers",
    description:
      "Message your trainer directly for guidance, feedback, or to discuss an issue with admin.",
  },
  {
    icon: ShoppingBag,
    title: "Gym Store",
    description:
      "Browse and order supplements and gear without leaving the app.",
  },
  {
    icon: ScanLine,
    title: "Quick Check-in",
    description:
      "Scan your membership card at the door, no manual sign-in signatures, no waiting.",
  },
];

const Services = () => {
  return (
    <section className="bg-slate-50 py-24 pb-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            One app, everything handled
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            From your first sign-up to your hundreth session, GymEase keeps it
            simple.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicesPoints.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800 dark:hover:shadow-brand-900/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/30 dark:group-hover:bg-brand-900/50">
                <Icon className="h-5.5 w-5.5 text-brand-600" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
