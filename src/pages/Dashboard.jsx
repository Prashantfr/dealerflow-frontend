import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useApplications from "../hooks/useApplications";
import ApplicationRow from "../components/ApplicationRow";
import { EmptyState, ErrorBanner, Skeleton } from "../components/Feedback";
import { DEPT_LABEL, FLOW, canAct, isActive } from "../utils/workflow";

const percent = (n, total) => (total ? (n / total) * 100 : 0);

function StatCard({ label, value, color }) {
  return (
    <div className="card">
      <p className="text-mut">{label}</p>
      <p className={`text-3xl font-bold ${color || ""}`}>{value}</p>
    </div>
  );
}

function StatusDonut({ inProgress, approved, rejected, total }) {
  const a = percent(inProgress, total);
  const b = a + percent(approved, total);
  const background = `conic-gradient(var(--color-warn) 0 ${a}%, var(--color-ok) ${a}% ${b}%, var(--color-bad) ${b}% 100%)`;
  const rows = [
    ["In progress", inProgress, "bg-warn"],
    ["Approved", approved, "bg-ok"],
    ["Rejected", rejected, "bg-bad"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div
        role="img"
        aria-label={`${inProgress} in progress, ${approved} approved, ${rejected} rejected`}
        className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
        style={{ background }}
      >
        <div className="h-20 w-20 rounded-full bg-panel" />
      </div>
      <ul className="space-y-2">
        {rows.map(([label, n, dot]) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm ${dot}`} />
            {label}: <b>{n}</b>
            <span className="text-mut">({Math.round(percent(n, total))}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StageBars({ counts, mine }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div>
      <p className="mb-2 text-sm text-mut">In progress only. Your stage is highlighted.</p>
      {FLOW.map((dept) => {
        const isMine = dept === mine;
        return (
          <div key={dept} className="my-3.5 flex items-center gap-3">
            <span className={`w-24 shrink-0 ${isMine ? "font-bold text-brand" : "text-mut"}`}>
              {DEPT_LABEL[dept]}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={`h-4 rounded ${isMine ? "bg-brand" : "bg-brand/50"}`}
                style={{ width: `${percent(counts[dept], max)}%` }}
              />
            </div>
            <b className="w-6 text-right">{counts[dept]}</b>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApplications();

  const inProgress = data.filter(isActive).length;
  const approved = data.filter((a) => a.status === "approved").length;
  const rejected = data.filter((a) => a.status === "rejected").length;
  const stageCounts = Object.fromEntries(
    FLOW.map((d) => [d, data.filter((a) => isActive(a) && a.currentDepartment === d).length])
  );
  const mine = data.filter((a) => canAct(a, user));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-mut">Welcome back, {user.name.split(" ")[0]}</p>
        </div>
        {mine.length > 0 && (
          <Link to="/applications?mine=1" className="btn btn-primary">
            Needs my action: {mine.length}
          </Link>
        )}
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      {loading && <Skeleton rows={4} />}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          title="No applications yet"
          text="New dealer applications will appear here."
          actionTo={user.role === "sales" ? "/applications/new" : undefined}
          actionLabel="New application"
        />
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total" value={data.length} />
            <StatCard label="In progress" value={inProgress} color="text-warn" />
            <StatCard label="Approved" value={approved} color="text-ok" />
            <StatCard label="Rejected" value={rejected} color="text-bad" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold">Status breakdown</h2>
              <StatusDonut inProgress={inProgress} approved={approved} rejected={rejected} total={data.length} />
            </section>
            <section className="card">
              <h2 className="mb-1 text-lg font-semibold">Applications per department stage</h2>
              <StageBars counts={stageCounts} mine={user.role} />
            </section>
          </div>

          <section className="card">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Awaiting your review</h2>
              <Link to="/applications" className="text-brand underline">
                View all
              </Link>
            </div>
            {mine.length === 0 ? (
              <p className="py-3 text-mut">Nothing is waiting for you right now.</p>
            ) : (
              <div className="divide-y divide-line">
                {mine.slice(0, 5).map((app) => (
                  <ApplicationRow key={app._id} app={app} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
