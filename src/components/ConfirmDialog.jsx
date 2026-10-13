import { useEffect, useRef } from "react";

const TONE = {
  ok: "bg-ok text-canvas",
  bad: "bg-bad text-canvas",
  warn: "bg-warn text-canvas",
};

export default function ConfirmDialog({ title, message, remarks, confirmLabel, tone = "ok", busy, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && !busy && onCancel();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        className="w-full max-w-md rounded-xl border border-line bg-panel p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <h2 id="dlg-title" className="text-lg font-bold">
          {title}
        </h2>
        <p className="mt-1.5 text-mut">{message}</p>
        {remarks && (
          <p className="mt-3 break-words rounded-lg border border-line bg-canvas p-3 text-sm">
            <span className="text-mut">Your remarks: </span>
            {remarks}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`btn flex-1 ${TONE[tone]}`}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
