import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

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

import AdminLayout from "./components/Layout/AdminLayout.jsx";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage.jsx";
import AdminMembersPage from "./pages/Admin/AdminMembersPage.jsx";
import AdminTrainersPage from "./pages/Admin/AdminTrainersPage.jsx";
import AdminGymPlansPage from "./pages/Admin/AdminGymPlansPage.jsx";
import AdminMembershipsPage from "./pages/Admin/AdminMembershipsPage.jsx";
import AdminStorePage from "./pages/Admin/AdminStorePage.jsx";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage.jsx";

import GymPlansPage from "./pages/Member/GymPlansPage.jsx";
import GymPlanDetailsPage from "./pages/Member/GymPlanDetailsPage.jsx";
import CustomPlanQuestionnairePage from "./pages/Member/CustomPlanQuestionnairePage.jsx";

import MyMembershipPage from "./pages/Member/MyMembershipPage.jsx";
import MemberSettingsPage from "./pages/Member/MemberSettingsPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";

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
        path: "/register",
        element: <MemberRegistrationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
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
        path: "/member/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <RequireMembership>
              <MemberDashboardPage />
            </RequireMembership>
          </ProtectedRoute>
        ),
      },
      {
        path: "/member/membership",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <MyMembershipPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/member/plans",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <RequireMembership>
              <GymPlansPage />
            </RequireMembership>
          </ProtectedRoute>
        ),
      },
      {
        path: "/member/plans/custom/questionnaire",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <RequireMembership>
              <CustomPlanQuestionnairePage />
            </RequireMembership>
          </ProtectedRoute>
        ),
      },
      {
        path: "/member/plans/:id",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <RequireMembership>
              <GymPlanDetailsPage />
            </RequireMembership>
          </ProtectedRoute>
        ),
      },
      {
        path: "/member/orders",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <RequireMembership>
              <MemberOrdersPage />
            </RequireMembership>
          </ProtectedRoute>
        ),
      },
      {
        path: "/member/settings",
        element: (
          <ProtectedRoute allowedRoles={["Member"]}>
            <MemberSettingsPage />
          </ProtectedRoute>
        ),
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
