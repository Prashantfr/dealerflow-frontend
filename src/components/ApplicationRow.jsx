import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { DEPT_LABEL, formatDate, isActive } from "../utils/workflow";

// The whole row is a link, so tapping anywhere on it opens the detail page
export default function ApplicationRow({ app }) {
  return (
    <Link
      to={`/applications/${app._id}`}
      className="flex min-h-14 items-center gap-3 rounded-lg px-2 py-3 text-ink hover:bg-white/5"
    >
      <div className="min-w-0 flex-1 md:grid md:grid-cols-[1.2fr_1.6fr_1.2fr] md:items-center md:gap-3">
        <p className="break-words font-semibold">{app.name}</p>
        <p className="break-words text-mut">{app.dealer}</p>
        <p className="text-sm text-mut">
          {formatDate(app.date)}
          {isActive(app) && ` · At ${DEPT_LABEL[app.currentDepartment] || app.currentDepartment}`}
        </p>
      </div>
      <StatusBadge status={app.status} />
      <span aria-hidden="true" className="text-2xl text-mut">
        ›
      </span>
    </Link>
  );
}
