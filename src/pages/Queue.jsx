import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useApplications from "../hooks/useApplications";
import ApplicationRow from "../components/ApplicationRow";
import { EmptyState, ErrorBanner, Skeleton } from "../components/Feedback";
import { DEPT_LABEL, FLOW, STATUS_LABEL, canAct } from "../utils/workflow";

export default function Queue() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useApplications();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const mine = params.get("mine") === "1";

  const setMine = (value) => setParams(value ? { mine: "1" } : {}, { replace: true });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((a) => {
      if (mine && !canAct(a, user)) return false;
      if (status !== "all" && a.status !== status) return false;
      if (stage !== "all" && a.currentDepartment !== stage) return false;
      if (term && !`${a.name} ${a.dealer}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [data, q, status, stage, mine, user]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 pb-8">
      <h1 className="text-2xl font-bold">Application queue</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="search" className="label">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Applicant or dealer"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="view" className="label">
            Show
          </label>
          <select id="view" value={mine ? "mine" : "all"} onChange={(e) => setMine(e.target.value === "mine")} className="field">
            <option value="all">All applications</option>
            <option value="mine">Needs my action</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="field">
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="stage" className="label">
            Stage
          </label>
          <select id="stage" value={stage} onChange={(e) => setStage(e.target.value)} className="field">
            <option value="all">All stages</option>
            {FLOW.map((d) => (
              <option key={d} value={d}>
                {DEPT_LABEL[d]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      {loading && <Skeleton rows={4} />}

      {!loading && !error && (
        <>
          <p className="text-mut" aria-live="polite">
            {filtered.length} of {data.length} applications
          </p>
          {filtered.length === 0 ? (
            <EmptyState
              title={data.length === 0 ? "No applications yet" : "No applications match your filters"}
              text={data.length === 0 ? "New dealer applications will appear here." : "Try clearing the search or filters."}
              actionTo={data.length === 0 && user.role === "sales" ? "/applications/new" : undefined}
              actionLabel="New application"
            />
          ) : (
            <div className="card divide-y divide-line p-2">
              {filtered.map((app) => (
                <ApplicationRow key={app._id} app={app} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
