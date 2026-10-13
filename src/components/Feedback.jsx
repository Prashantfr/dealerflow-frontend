import { Link } from "react-router-dom";

export function Skeleton({ rows = 3 }) {
  return (
    <div className="card" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="my-3 h-4 rounded bg-line motion-safe:animate-pulse"
          style={{ width: `${[60, 92, 45, 75][i % 4]}%` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({ title, text, actionTo, actionLabel }) {
  return (
    <div className="card py-8 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-mut">{text}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-4">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bad bg-bad/10 px-4 py-3"
    >
      <span className="min-w-0 flex-1 break-words">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn border-bad text-bad hover:bg-bad/10">
          Retry
        </button>
      )}
    </div>
  );
}

export function SuccessBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-xl border border-ok bg-ok/10 px-4 py-3"
    >
      <span className="min-w-0 flex-1 break-words">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss message" className="btn min-h-11 px-3 text-ok">
          ✕
        </button>
      )}
    </div>
  );
}
