import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectMap: Record<UserRole, string> = {
      ADMIN: "/admin/dashboard",
      MEDICO: "/doctor/dashboard",
      PACIENTE: "/app/dashboard",
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <Outlet />;
}
