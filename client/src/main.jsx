import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MembershipPlansPage from "./pages/MembershipPlansPage.jsx";
import MemberRegistrationPage from "./pages/MemberRegistrationPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

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
        path: "/pricing",
        element: <MembershipPlansPage />,
      },
      {
        path: "/register",
        element: <MemberRegistrationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
