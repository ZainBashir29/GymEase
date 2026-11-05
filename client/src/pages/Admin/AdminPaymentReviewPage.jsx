import { useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Loader2,
  AlertTriangle,
  CreditCard,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../lib/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

// Fired after a resolution so AdminLayout can refresh its sidebar badge.
export const PAYMENT_REVIEW_UPDATED_EVENT = "payment-review-updated";

const ACTIONS = {
  approve: {
    label: "Approve",
    icon: CheckCircle2,
    buttonClass:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-none",
    noteRequired: false,
    title: "Approve this payment?",
    describe: (p) =>
      p.type === "StoreOrder"
        ? "The order will be marked as paid, stock will be deducted, the member's cart cleared and a receipt emailed. If any item is now out of stock, the order is automatically cancelled and refunded."
        : "The membership will be activated (replacing any current active membership) and a receipt emailed to the member.",
  },
  refund: {
    label: "Refund",
    icon: RotateCcw,
    buttonClass:
      "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-200 dark:shadow-none",
    noteRequired: true,
    title: "Refund this payment?",
    describe: () =>
      "The full amount SafePay actually charged will be returned to the customer. The order will be cancelled or the pending membership removed. This cannot be undone.",
  },
  reject: {
    label: "Reject",
    icon: XCircle,
    buttonClass:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 dark:shadow-none",
    noteRequired: true,
    title: "Reject this payment?",
    describe: () =>
      "The payment will be marked as failed and the order cancelled or pending membership removed. No money is returned.",
    warning:
      "Only reject if you have confirmed in the SafePay dashboard that no money was captured. Otherwise use Refund.",
  },
};

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const statusBadge = {
  successful:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  refunded:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  failed: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  review:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const CauseSummary = ({ payment }) => {
  const cause = payment.cause;
  if (payment.type === "StoreOrder") {
    return (
      <div className="text-xs text-slate-500 dark:text-slate-400">
        <div>
          Order <span className="font-mono">#{String(payment.paymentCauseId).slice(-8)}</span>
          {cause && (
            <>
              {" "}| total {formatPKR(cause.totalAmount)} | {cause.paymentStatus}
            </>
          )}
        </div>
        {cause?.products?.length > 0 && (
          <div className="mt-0.5 truncate max-w-xs">
            {cause.products
              .map((i) => `${i.productId?.name || "Item"} x${i.quantity}`)
              .join(", ")}
          </div>
        )}
        {!cause && <div className="text-rose-500">Order not found</div>}
      </div>
    );
  }
  return (
    <div className="text-xs text-slate-500 dark:text-slate-400">
      {cause ? (
        <>
          {cause.name} | {formatPKR(cause.price)} | {cause.duration} days
        </>
      ) : (
        <span className="text-rose-500">Plan not found</span>
      )}
    </div>
  );
};

const ResolveModal = ({ payment, action, onClose, onResolved }) => {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const config = ACTIONS[action];
  const Icon = config.icon;
  const canSubmit = !submitting && (!config.noteRequired || note.trim());

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post(`/admin/payments/review/${payment._id}`, {
        action,
        note: note.trim(),
      });
      onResolved(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
        onClick={submitting ? undefined : onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {config.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
            <div className="font-medium text-slate-900 dark:text-white">
              {payment.memberId?.fullName || "Unknown member"}{" "}
              <span className="font-normal text-slate-500">
                ({payment.memberId?.email || "-"})
              </span>
            </div>
            <div className="mt-1 text-slate-600 dark:text-slate-300">
              Expected amount: <strong>{formatPKR(payment.amount)}</strong>
            </div>
            <div className="mt-1 text-orange-700 dark:text-orange-400">
              Reason: {payment.reviewReason || "-"}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
            {config.describe(payment)}
          </p>

          {config.warning && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {config.warning}
            </div>
          )}

          <div>
            <label
              htmlFor="resolution-note"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Note {config.noteRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400">(optional)</span>}
            </label>
            <textarea
              id="resolution-note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
              placeholder="Explain why you are taking this action (kept in the audit log)"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="mt-1 text-right text-xs text-slate-400">{note.length}/500</div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${config.buttonClass}`}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {config.label}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPaymentReviewPage = () => {
  const { isSystemAdmin } = useAuth();
  const [view, setView] = useState("review");
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [modal, setModal] = useState(null); // { payment, action }
  const [toast, setToast] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  // Data is fetched in the effect and applied in the promise callback, with an
  // `ignore` flag so stale responses (fast tab/page switches) are discarded.
  useEffect(() => {
    if (!isSystemAdmin) return;
    let ignore = false;

    Promise.all([
      api.get("/admin/payments/review", { params: { status: view, page, limit: 20 } }),
      api.get("/admin/payments/review/count"),
    ])
      .then(([{ data: list }, { data: count }]) => {
        if (ignore) return;
        setLoadError("");
        setPayments(list.data?.payments || []);
        setPagination(list.data?.pagination || { page: 1, totalPages: 1, total: 0 });
        setPendingCount(count.data?.count || 0);
      })
      .catch((error) => {
        if (ignore) return;
        setLoadError(error.response?.data?.message || "Failed to load payments");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isSystemAdmin, view, page, reloadKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!isSystemAdmin) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center p-8">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Only the System Admin can review payments.
          </p>
        </div>
      </div>
    );
  }

  const handleResolved = (message) => {
    setModal(null);
    setToast(message || "Payment resolved");
    window.dispatchEvent(new Event(PAYMENT_REVIEW_UPDATED_EVENT));
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const switchView = (next) => {
    if (next === view) return;
    setLoading(true);
    setView(next);
    setPage(1);
  };

  const changePage = (next) => {
    setLoading(true);
    setPage(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Review</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Payments that SafePay reported as completed but failed automatic verification. They
          have not been fulfilled yet.
        </p>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
          {toast}
        </div>
      )}

      <div className="flex gap-2">
        {[
          { key: "review", label: "Needs review", count: pendingCount },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchView(tab.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              view === tab.key
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : loadError ? (
          <div className="p-8 text-center text-rose-600">{loadError}</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {view === "review" ? "No payments need review." : "No resolved payments yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">
                    {view === "review" ? "Actions" : "Resolution"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p._id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {p.memberId?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">{p.memberId?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {p.type === "StoreOrder" ? (
                          <ShoppingBag className="h-4 w-4 text-brand-600" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-brand-600" />
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatPKR(p.amount)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {p.type === "StoreOrder" ? "Store order" : "Membership"}
                        </span>
                      </div>
                      <div className="mt-1">
                        <CauseSummary payment={p} />
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-4 text-orange-700 dark:text-orange-400">
                      {p.reviewReason || "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {view === "review" ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          {Object.entries(ACTIONS).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={p.resolution?.inProgress}
                                onClick={() => setModal({ payment: p, action: key })}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${cfg.buttonClass}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 font-semibold capitalize ${statusBadge[p.status] || ""}`}
                          >
                            {p.resolution?.action} | {p.status}
                          </span>
                          <div className="text-slate-500">
                            by {p.resolution?.resolvedBy?.fullName || "-"}
                          </div>
                          <div className="text-slate-500">{formatDate(p.resolution?.resolvedAt)}</div>
                          {p.resolution?.note && (
                            <div className="ml-auto max-w-xs italic text-slate-600 dark:text-slate-300">
                              "{p.resolution.note}"
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
                className="rounded-lg p-1.5 ring-1 ring-slate-200 disabled:opacity-40 cursor-pointer dark:ring-slate-700"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => changePage(page + 1)}
                className="rounded-lg p-1.5 ring-1 ring-slate-200 disabled:opacity-40 cursor-pointer dark:ring-slate-700"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <ResolveModal
          payment={modal.payment}
          action={modal.action}
          onClose={() => setModal(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
};

export default AdminPaymentReviewPage;
