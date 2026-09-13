import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Loader2,
  AlertTriangle,
  Download,
  Dumbbell,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import api from "../../lib/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const MembershipCard = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const { data } = await api.get("/memberships/current");
        setMembership(data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setMembership(null);
        } else {
          setError("Couldn't load membership details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembership();
  }, []);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `GymEase_ID_${user?.fullName?.replace(/\s+/g, "_") || "Member"}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to download card:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <CreditCard
          className="mx-auto h-7 w-7 text-slate-400"
          strokeWidth={1.5}
        />
        <p className="mt-3 text-sm font-medium text-slate-600">
          No active membership
        </p>
        <Link
          to="/pricing"
          className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View plans &rarr;
        </Link>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining >= 0;

  
  const qrPayload = `${window.location.origin}/verify/${membership._id}`;

  const renderCard = (isModal = false) => (
    <div
      ref={!isModal ? cardRef : null}
      onClick={() => !isModal && setIsModalOpen(true)}
      className={`relative overflow-hidden rounded-xl bg-linear-to-br from-brand-600 to-brand-800 text-white shadow-md transition-transform ${!isModal ? "cursor-pointer hover:scale-[1.02] p-6" : "p-8 shadow-2xl"}`}
    >
      <div
        className={`absolute -right-12 -top-12 rounded-full bg-white/10 blur-2xl ${isModal ? "h-48 w-48" : "h-40 w-40"}`}
      ></div>
      <div
        className={`absolute -bottom-8 -left-8 rounded-full bg-black/10 blur-xl ${isModal ? "h-40 w-40" : "h-32 w-32"}`}
      ></div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 opacity-90">
            <Dumbbell
              className={isModal ? "h-6 w-6" : "h-5 w-5"}
              strokeWidth={2.5}
            />
            <span
              className={`${isModal ? "text-base" : "text-sm"} font-bold tracking-tight`}
            >
              GymEase
            </span>
          </div>
          <div className={isModal ? "mt-8" : "mt-6"}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200">
              Member
            </p>
            <p
              className={`${isModal ? "text-xl" : "text-lg"} font-bold leading-tight`}
            >
              {user?.fullName || "Gym Member"}
            </p>
          </div>
          <div className={`flex ${isModal ? "mt-6 gap-8" : "mt-4 gap-6"}`}>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200">
                Plan
              </p>
              <p
                className={`${isModal ? "text-base" : "text-sm"} font-semibold`}
              >
                {membership.membershipPlanId?.name || "Active Plan"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-brand-200">
                Valid Thru
              </p>
              <p
                className={`${isModal ? "text-base" : "text-sm"} font-semibold`}
              >
                {formatDate(membership.endDate)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex shrink-0 flex-col items-center justify-center rounded-lg bg-white shadow-sm ${isModal ? "p-3" : "p-2"}`}
        >
          <QRCodeSVG
            value={qrPayload}
            size={isModal ? 96 : 70}
            level="M"
            includeMargin={false}
            className="rounded-sm"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-slate-900">
          Digital ID Card
        </h3>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {isDownloading ? "Saving..." : "Download"}
        </button>
      </div>

      {renderCard(false)}

      {isExpiringSoon && (
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your membership expires in {daysRemaining}{" "}
            {daysRemaining === 1 ? "day" : "days"}. Renew to avoid interruption.
          </span>
        </div>
      )}

      <div className="mt-5 flex justify-center border-t border-slate-100 pt-4">
        <Link
          to="/member/membership"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Manage Membership &rarr;
        </Link>
      </div>

      
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg scale-110 md:scale-125 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -right-4 -top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-md hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            {renderCard(true)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipCard;
