import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

// Restricts a page to certain roles (the backend enforces this too)
export function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user.role)) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="text-lg font-semibold">Not available for your role</p>
        <p className="mt-1 text-mut">This page is only for: {roles.join(", ")}.</p>
      </div>
    );
  }
  return children;
}
