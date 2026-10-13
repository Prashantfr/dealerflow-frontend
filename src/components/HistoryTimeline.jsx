import { DEPT_LABEL, formatDateTime, isActive } from "../utils/workflow";

const META = {
  approve: { dot: "bg-ok", icon: "✓" },
  reject: { dot: "bg-bad", icon: "✕" },
  return: { dot: "bg-warn", icon: "↩" },
};

function titleFor(entry, hadReturnBefore) {
  if (entry.action === "reject") return "Rejected";
  if (entry.action === "return") return "Returned for correction";
  if (entry.department === "sales") return hadReturnBefore ? "Resubmitted" : "Submitted";
  return "Approved";
}

export default function HistoryTimeline({ app }) {
  const history = app.history || [];
  let seenReturn = false;

  const items = history.map((entry, i) => {
    const meta = META[entry.action] || { dot: "bg-line-strong", icon: "•" };
    const title = titleFor(entry, seenReturn);
    if (entry.action === "return") seenReturn = true;
    return { key: entry._id || i, meta, title, entry };
  });

  const waiting = isActive(app);

  if (items.length === 0 && !waiting) {
    return <p className="text-mut">No actions recorded yet.</p>;
  }

  return (
    <ol>
      {items.map(({ key, meta, title, entry }, i) => {
        const isLast = i === items.length - 1 && !waiting;
        return (
          <li key={key} className="relative break-words pb-5 pl-11">
            {!isLast && (
              <span aria-hidden="true" className="absolute bottom-0 left-3.5 top-8 w-0.5 bg-line" />
            )}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full font-bold text-canvas ${meta.dot}`}
            >
              {meta.icon}
            </span>
            <p>
              <span className="font-semibold">{title}</span>
              <span className="text-mut"> · {DEPT_LABEL[entry.department] || entry.department}</span>
            </p>
            <p className="text-sm text-mut">
              {[entry.actedBy, formatDateTime(entry.date)].filter(Boolean).join(" · ")}
            </p>
            {entry.remarks && <p className="mt-1">{entry.remarks}</p>}
          </li>
        );
      })}
      {waiting && (
        <li className="relative pl-11">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand font-bold text-canvas"
          >
            ●
          </span>
          <p className="font-semibold text-brand">Awaiting {DEPT_LABEL[app.currentDepartment]} review</p>
          <p className="text-sm text-mut">Current stage</p>
        </li>
      )}
    </ol>
  );
}
