import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios.js";

import {
  Check,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Sparkles,
  Activity,
  Flame,
  BicepsFlexed,
  Footprints,
  Accessibility,
  Sprout,
  Zap,
  CalendarDays,
  Shirt,
  PersonStanding,
  Target,
} from "lucide-react";

const questions = [
  {
    title: "What is your primary fitness goal?",
    options: [
      {
        id: "weight_loss",
        label: "Weight Loss",
        icon: Flame,
        desc: "Burn fat and slim down",
      },
      {
        id: "muscle_gain",
        label: "Muscle Gain",
        icon: BicepsFlexed,
        desc: "Build strength and size",
      },
      {
        id: "endurance",
        label: "Endurance",
        icon: Footprints,
        desc: "Improve stamina and cardio",
      },
      {
        id: "flexibility",
        label: "Flexibility",
        icon: Accessibility,
        desc: "Increase mobility and range",
      },
    ],
  },
  {
    title: "What is your current fitness level?",
    options: [
      {
        id: "beginner",
        label: "Beginner",
        icon: Sprout,
        desc: "Just starting out",
      },
      {
        id: "intermediate",
        label: "Intermediate",
        icon: Zap,
        desc: "Familiar with basic workouts",
      },
      {
        id: "advanced",
        label: "Advanced",
        icon: Flame,
        desc: "Experienced and fit",
      },
    ],
  },
  {
    title: "How many days per week can you train?",
    options: [
      {
        id: "3",
        label: "3 Days",
        icon: CalendarDays,
        desc: "Light commitment",
      },
      {
        id: "4",
        label: "4 Days",
        icon: CalendarDays,
        desc: "Moderate commitment",
      },
      {
        id: "5",
        label: "5 Days",
        icon: CalendarDays,
        desc: "Serious commitment",
      },
      {
        id: "6",
        label: "6 Days",
        icon: CalendarDays,
        desc: "Maximum results",
      },
    ],
  },
  {
    title: "Which body area do you want to focus on?",
    options: [
      {
        id: "upper_body",
        label: "Upper Body",
        icon: Shirt,
        desc: "Chest, back, arms, shoulders",
      },
      {
        id: "lower_body",
        label: "Lower Body",
        icon: PersonStanding,
        desc: "Legs and glutes",
      },
      {
        id: "core",
        label: "Core",
        icon: Target,
        desc: "Abs and stability",
      },
      {
        id: "full_body",
        label: "Full Body",
        icon: PersonStanding,
        desc: "Balanced overall development",
      },
    ],
  },
];

const CustomPlanQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSelect = (optionId) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionId;
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.includes("")) {
      setError("Please answer all questions before generating your plan.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/gym-plans/custom/activate", { answers });

      navigate("/member/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate custom plan. Make sure you have an active membership and no other active plans.",
      );
      setSubmitting(false);
    }
  };

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600 shadow-sm">
            <Wand2 className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Custom Plan Generator
          </h1>

          <p className="text-slate-500">
            Let AI craft the perfect workout regimen for your body.
          </p>
        </div>

        <div className="mb-8 relative">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2 px-1">
            <span>
              Question {currentStep + 1} of {questions.length}
            </span>

            <span>{Math.round(progress)}% Completed</span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
          {submitting ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative">
                <Activity className="w-16 h-16 text-brand-500 animate-pulse" />

                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-6 mb-2">
                Generating Your Plan...
              </h3>

              <p className="text-slate-500 max-w-sm">
                We are analyzing your inputs and assigning the best available
                trainer to guide you.
              </p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
                {question.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt) => {
                  const isSelected = answers[currentStep] === opt.id;

                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={`text-left p-6 rounded-2xl border-2 transition-all group relative overflow-hidden
                        ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10"
                            : "border-slate-100 hover:border-brand-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`shrink-0 ${
                            isSelected
                              ? "text-brand-600 scale-110 transition-transform"
                              : "text-slate-400 group-hover:text-brand-500 transition-all"
                          }`}
                        >
                          <Icon className="w-8 h-8" strokeWidth={1.8} />
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`font-bold text-lg mb-1 ${
                              isSelected ? "text-brand-900" : "text-slate-900"
                            }`}
                          >
                            {opt.label}
                          </h3>

                          <p
                            className={`text-sm ${
                              isSelected ? "text-brand-700" : "text-slate-500"
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!submitting && (
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-colors cursor-pointer
                ${
                  currentStep === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!answers[currentStep]}
                className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none cursor-pointer"
              >
                Generate Plan
                <Wand2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!answers[currentStep]}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPlanQuestionnaire;
