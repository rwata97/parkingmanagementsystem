import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider"; // ⬅️ adjust path
import { Routes } from "../Routes";

const Login = lazy(() => import("@/components/pages/LoginPage"));
const Resident = lazy(() => import("@/components/pages/ResidentPage"));
const Admin = lazy(() => import("@/components/pages/AdminPage"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const Register = lazy(() => import("@/components/pages/Register"));

type RequireAuthProps = {
  children: React.ReactNode;
  role?: "ADMIN" | "RESIDENT";
};

function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, loading } = useAuth();

  // TODO: Add real loading component
  if (loading) {
    return <div />;
  }

  if (!user) {
    return <Navigate to={Routes.Login} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={Routes.Home} replace />;
  }

  return children;
}

const routes: RouteObject[] = [
  {
    path: Routes.Login,
    element: (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: Routes.Register,
    element: (
      <Suspense fallback={null}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: Routes.Home,
    element: (
      <RequireAuth>
        <Suspense fallback={null}>
          <Resident />
        </Suspense>
      </RequireAuth>
    ),
  },
  {
    path: Routes.Admin,
    element: (
      <RequireAuth role="ADMIN">
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      </RequireAuth>
    ),
  },

  {
    path: "*",
    element: (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    ),
  },
];

export const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes);
