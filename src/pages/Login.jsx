import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { DEMO_PASSWORD, DEMO_ROLES } from "../utils/workflow";
import { ErrorBanner } from "../components/Feedback";

export default function Login() {
  const { user, login, sessionExpired } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState(DEMO_ROLES[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  // Show a hint if the server takes long to respond (free hosting wakes up slowly)
  useEffect(() => {
    if (!loading) return setSlow(false);
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  if (user) return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  const selected = DEMO_ROLES.find((r) => r.email === email.trim().toLowerCase());

  const pickRole = (r) => {
    setEmail(r.email);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="pt-4">
          <h1 className="text-3xl font-bold">DealerFlow</h1>
          <p className="text-mut">Dealer onboarding and approvals</p>
        </div>

        {sessionExpired && <ErrorBanner message="Your session expired. Please sign in again." />}

        <div>
          <p id="role-label" className="mb-2 text-mut">
            Choose a demo role
          </p>
          <div role="radiogroup" aria-labelledby="role-label" className="grid grid-cols-2 gap-2.5">
            {DEMO_ROLES.map((r) => {
              const on = selected?.role === r.role;
              return (
                <label
                  key={r.role}
                  className={`relative block min-h-[4.5rem] cursor-pointer rounded-xl border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white ${
                    on ? "border-2 border-brand bg-sel" : "border-line bg-panel"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.role}
                    checked={on}
                    onChange={() => pickRole(r)}
                    className="absolute opacity-0"
                  />
                  <span className="block font-semibold">{r.label}</span>
                  <span className="text-sm text-mut">{r.hint}</span>
                  {on && (
                    <span aria-hidden="true" className="absolute right-3 top-2 font-bold text-brand">
                      ✓
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-mut">
            Selecting a role fills the demo credentials. Sign in uses the real login API.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <ErrorBanner message={error} />
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Signing in…" : selected ? `Sign in as ${selected.label}` : "Sign in"}
          </button>
          {slow && (
            <p className="text-sm text-mut" role="status">
              The server may be waking up. This can take up to a minute on free hosting.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
