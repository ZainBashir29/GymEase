import React, { useState } from "react";
import { Sparkles, Users, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import api from "../../lib/axios.js";

const TrainerTierUpgradeBanner = ({ trainerTierStatus, onRebalanceComplete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      sessionStorage.getItem(
        `dismiss_trainer_tier_${trainerTierStatus?.maxAllowedTrainers}_${trainerTierStatus?.assignedTrainersCount}`,
      ) === "true"
    );
  });

  if (!trainerTierStatus || isDismissed) return null;

  const { canUpgradeTrainers, needsDowngradeTrainers, assignedTrainersCount, maxAllowedTrainers, membershipPlanName } =
    trainerTierStatus;

  if (!canUpgradeTrainers && !needsDowngradeTrainers) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(
      `dismiss_trainer_tier_${maxAllowedTrainers}_${assignedTrainersCount}`,
      "true",
    );
  };

  const handleRebalance = async () => {
    setIsUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const { data } = await api.post("/gym-plans/rebalance-trainers");
      setSuccessMessage(
        data.message ||
          `Successfully updated your upcoming workouts to rotate across ${maxAllowedTrainers} trainer(s)!`,
      );
      if (onRebalanceComplete) {
        setTimeout(() => {
          onRebalanceComplete();
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to rebalance trainers. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-300 bg-linear-to-r from-brand-50 to-indigo-50 p-5 shadow-sm dark:border-brand-800 dark:from-brand-950/40 dark:to-slate-900">
      <button
        onClick={handleDismiss}
        className="absolute top-3.5 right-3.5 rounded-lg p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        title="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {successMessage ? (
        <div className="flex items-center gap-3 text-success dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm dark:bg-brand-500">
              {canUpgradeTrainers ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <Users className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {canUpgradeTrainers
                  ? "Membership Tier Upgrade: More Trainers Available!"
                  : "Trainer Allocation Adjustment"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {canUpgradeTrainers
                  ? `Your ${membershipPlanName} membership allows up to ${maxAllowedTrainers} personal trainers for your workouts (currently assigned: ${assignedTrainersCount}). Would you like to redistribute your upcoming sessions across ${maxAllowedTrainers} trainers or keep your current trainer?`
                  : `Your current membership plan allows up to ${maxAllowedTrainers} trainer(s) (currently assigned: ${assignedTrainersCount}). Update your upcoming sessions to match your tier entitlement.`}
              </p>
              {errorMessage && (
                <p className="mt-2 text-xs font-semibold text-danger">{errorMessage}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
            {canUpgradeTrainers && (
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isUpdating}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Keep Current
              </button>
            )}
            <button
              type="button"
              onClick={handleRebalance}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : canUpgradeTrainers ? (
                `Distribute Across ${maxAllowedTrainers} Trainers`
              ) : (
                `Sync to ${maxAllowedTrainers} Trainer`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerTierUpgradeBanner;
