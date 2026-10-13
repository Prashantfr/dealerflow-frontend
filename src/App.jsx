import { Link, Route, Routes } from "react-router-dom";
import ProtectedRoute, { RoleRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import ApplicationDetail from "./pages/ApplicationDetail";
import ApplicationForm from "./pages/ApplicationForm";

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-1 text-mut">That page does not exist.</p>
      <Link to="/" className="btn btn-primary mt-5">
        Go to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Queue />} />
        <Route
          path="applications/new"
          element={
            <RoleRoute roles={["sales"]}>
              <ApplicationForm />
            </RoleRoute>
          }
        />
        <Route path="applications/:id" element={<ApplicationDetail />} />
        <Route
          path="applications/:id/edit"
          element={
            <RoleRoute roles={["sales"]}>
              <ApplicationForm />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
