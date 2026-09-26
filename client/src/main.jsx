import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

import HomePage from "./pages/HomePage.jsx";
import MembershipPlansPage from "./pages/MembershipPlansPage.jsx";
import MemberRegistrationPage from "./pages/MemberRegistrationPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MemberDashboardPage from "./pages/Member/MemberDashboardPage.jsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.jsx";
import RequireMembership from "./components/Layout/RequireMembership.jsx";
import TrainerDashboardPage from "./pages/Trainer/TrainerDashboardPage.jsx";
import PaymentSuccessPage from "./pages/PaymentSuccessPage.jsx";
import PaymentFailurePage from "./pages/PaymentFailurePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import StorePage from "./pages/Store/StorePage.jsx";
import ProductDetailsPage from "./pages/Store/ProductDetailsPage.jsx";
import MemberOrdersPage from "./pages/Store/MemberOrdersPage.jsx";
import VerifyMembershipPage from "./pages/VerifyMembershipPage.jsx";

import AdminLayout from "./components/Layout/AdminLayout.jsx";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage.jsx";
import AdminMembersPage from "./pages/Admin/AdminMembersPage.jsx";
import AdminTrainersPage from "./pages/Admin/AdminTrainersPage.jsx";
import AdminTrainerPerformancePage from "./pages/Admin/AdminTrainerPerformancePage.jsx";
import AdminGymPlansPage from "./pages/Admin/AdminGymPlansPage.jsx";
import AdminMembershipsPage from "./pages/Admin/AdminMembershipsPage.jsx";
import AdminStorePage from "./pages/Admin/AdminStorePage.jsx";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage.jsx";

import MemberLayout from "./components/Layout/MemberLayout.jsx";

import GymPlansPage from "./pages/Member/GymPlansPage.jsx";
import GymPlanDetailsPage from "./pages/Member/GymPlanDetailsPage.jsx";
import CustomPlanQuestionnairePage from "./pages/Member/CustomPlanQuestionnairePage.jsx";

import MyMembershipPage from "./pages/Member/MyMembershipPage.jsx";
import MemberPricingPage from "./pages/Member/MemberPricingPage.jsx";
import MemberSettingsPage from "./pages/Member/MemberSettingsPage.jsx";
import AcceptInvitationPage from "./pages/AcceptInvitationPage.jsx";
import AdminSubAdminsPage from "./pages/Admin/AdminSubAdminsPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import CompleteProfilePage from "./pages/CompleteProfilePage.jsx";

import MyMembersPage from "./pages/Trainer/MyMembersPage.jsx";

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
          <RouterProvider router={router} />
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
