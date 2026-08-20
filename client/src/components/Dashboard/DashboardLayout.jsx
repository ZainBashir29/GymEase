import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, navItems }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
