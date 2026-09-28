import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Loader2 } from "lucide-react";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const MembershipPlansPage = lazy(() => import("./pages/MembershipPlansPage.jsx"));
const MemberRegistrationPage = lazy(() => import("./pages/MemberRegistrationPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const MemberDashboardPage = lazy(() => import("./pages/Member/MemberDashboardPage.jsx"));
import ProtectedRoute from "./components/Layout/ProtectedRoute.jsx";
import RequireMembership from "./components/Layout/RequireMembership.jsx";
const TrainerDashboardPage = lazy(() => import("./pages/Trainer/TrainerDashboardPage.jsx"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage.jsx"));
const PaymentFailurePage = lazy(() => import("./pages/PaymentFailurePage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const StorePage = lazy(() => import("./pages/Store/StorePage.jsx"));
const ProductDetailsPage = lazy(() => import("./pages/Store/ProductDetailsPage.jsx"));
const MemberOrdersPage = lazy(() => import("./pages/Store/MemberOrdersPage.jsx"));
const VerifyMembershipPage = lazy(() => import("./pages/VerifyMembershipPage.jsx"));

const AdminLayout = lazy(() => import("./components/Layout/AdminLayout.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/Admin/AdminDashboardPage.jsx"));
const AdminMembersPage = lazy(() => import("./pages/Admin/AdminMembersPage.jsx"));
const AdminTrainersPage = lazy(() => import("./pages/Admin/AdminTrainersPage.jsx"));
const AdminTrainerPerformancePage = lazy(() => import("./pages/Admin/AdminTrainerPerformancePage.jsx"));
const AdminGymPlansPage = lazy(() => import("./pages/Admin/AdminGymPlansPage.jsx"));
const AdminMembershipsPage = lazy(() => import("./pages/Admin/AdminMembershipsPage.jsx"));
const AdminStorePage = lazy(() => import("./pages/Admin/AdminStorePage.jsx"));
const AdminOrdersPage = lazy(() => import("./pages/Admin/AdminOrdersPage.jsx"));

const MemberLayout = lazy(() => import("./components/Layout/MemberLayout.jsx"));

const GymPlansPage = lazy(() => import("./pages/Member/GymPlansPage.jsx"));
const GymPlanDetailsPage = lazy(() => import("./pages/Member/GymPlanDetailsPage.jsx"));
const CustomPlanQuestionnairePage = lazy(() => import("./pages/Member/CustomPlanQuestionnairePage.jsx"));

const MyMembershipPage = lazy(() => import("./pages/Member/MyMembershipPage.jsx"));
const MemberPricingPage = lazy(() => import("./pages/Member/MemberPricingPage.jsx"));
const MemberSettingsPage = lazy(() => import("./pages/Member/MemberSettingsPage.jsx"));
const AcceptInvitationPage = lazy(() => import("./pages/AcceptInvitationPage.jsx"));
const AdminSubAdminsPage = lazy(() => import("./pages/Admin/AdminSubAdminsPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage.jsx"));
const CompleteProfilePage = lazy(() => import("./pages/CompleteProfilePage.jsx"));

const MyMembersPage = lazy(() => import("./pages/Trainer/MyMembersPage.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/pricing",
        element: <MembershipPlansPage />,
      },
      {
        path: "/store",
        element: <StorePage />,
      },
      {
        path: "/store/product/:id",
        element: <ProductDetailsPage />,
      },
      {
        path: "/verify/:id",
        element: <VerifyMembershipPage />,
      },
      {
        path: "/register",
        element: <MemberRegistrationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/complete-profile",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            {" "}
            <CompleteProfilePage />{" "}
          </ProtectedRoute>
        ),
      },
      
      {
        path: "/accept-invitation/:token",
        element: <AcceptInvitationPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/change-password/:token",
        element: <ChangePasswordPage />,
      },
      {
        path: "/member",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <MemberLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            element: (
              <RequireMembership>
                <Outlet />
              </RequireMembership>
            ),
            children: [
              {
                path: "dashboard",
                element: <MemberDashboardPage />,
              },
              {
                path: "plans",
                element: <GymPlansPage />,
              },
              {
                path: "plans/custom/questionnaire",
                element: <CustomPlanQuestionnairePage />,
              },
              {
                path: "plans/:id",
                element: <GymPlanDetailsPage />,
              },
              {
                path: "orders",
                element: <MemberOrdersPage />,
              },
            ],
          },
          {
            path: "membership",
            element: <MyMembershipPage />,
          },
          {
            path: "membership/plans",
            element: <MemberPricingPage />,
          },
          {
            path: "settings",
            element: <MemberSettingsPage />,
          },
        ],
      },
      {
        path: "/trainer/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Trainer"]}>
            <TrainerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/trainer/members",
        element: (
          <ProtectedRoute allowedRoles={["Trainer"]}>
            <MyMembersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/payment/success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "/payment/cancel",
        element: <PaymentFailurePage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["Admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "members",
        element: <AdminMembersPage />,
      },
      {
        path: "trainers",
        element: <AdminTrainersPage />,
      },
      {
        path: "trainers/performance/:id",
        element: <AdminTrainerPerformancePage />,
      },
      {
        path: "gym-plans",
        element: <AdminGymPlansPage />,
      },
      {
        path: "memberships",
        element: <AdminMembershipsPage />,
      },
      {
        path: "store",
        element: <AdminStorePage />,
      },
      {
        path: "orders",
        element: <AdminOrdersPage />,
      },
      {
        path: "sub-admins",
        element: <AdminSubAdminsPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <Suspense
            fallback={
              <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3.5 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                  <span className="text-sm font-semibold tracking-wide text-slate-700">Loading...</span>
                </div>
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
