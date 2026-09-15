import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import api from "../../lib/axios.js";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";

const trainerNavbarItems = [
  {
    label: "Dashboard",
    to: "/trainer/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "My Members", to: "/trainer/members", icon: Users },
];

const MyMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get("/trainers/me/members?scope=all");
        setMembers(data.data.members || []);
      } catch (err) {
        setError("Couldn't load your assigned members.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <DashboardLayout navItems={trainerNavbarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Members</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all the members currently assigned to you for training sessions.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
          {error}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <Users className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <h3 className="mt-4 text-base font-bold text-slate-900">
            No Members Assigned
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            You don't have any members assigned to you right now. When members
            book sessions with you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-md"
            >
              <div className="flex flex-1 flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-100 shadow-sm ring-4 ring-brand-50">
                  {member.profilePicture ? (
                    <img
                      src={member.profilePicture}
                      alt={member.fullName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-brand-600" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {member.fullName}
                </h3>
                <p className="text-sm text-slate-500">@{member.username}</p>
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Age</span>
                  <span className="font-semibold text-slate-900">
                    {member.age || "N/A"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span className="truncate pl-4 font-semibold text-slate-900">
                    {member.email}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyMembersPage;
