import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAppointment, submitAction } from "../api/appointments";
import { getErrorMessage } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import WorkflowStepper from "../components/WorkflowStepper";
import HistoryTimeline from "../components/HistoryTimeline";
import ConfirmDialog from "../components/ConfirmDialog";
import { ErrorBanner, Skeleton, SuccessBanner } from "../components/Feedback";
import {
  DEPT_LABEL,
  approveLabel,
  canAct,
  canEdit,
  canReturn,
  formatDate,
  isActive,
  nextDepartment,
} from "../utils/workflow";


function successMessage(action, updated) {
    if (action === "reject") {
        return "Application rejected.";
    }

    if (action === "return") {
        return `Application returned to ${
            DEPT_LABEL[updated.currentDepartment]
        } for correction.`;
    }

    if (updated.status === "approved") {
        return "Application approved. Dealer onboarding is complete.";
    }

    return `Application sent to ${
        DEPT_LABEL[updated.currentDepartment]
    }.`;
}


export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [flash, setFlash] = useState(location.state?.flash || "");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setApp(await fetchAppointment(id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const askConfirm = (action) => {
    if (action !== "approve" && !remarks.trim()) {
      setActionError("Remarks are required to reject or return an application.");
      return;
    }
    setActionError("");
    setConfirming(action);
  };

  const runAction = async () => {
    setBusy(true);
    try {
      const updated = await submitAction(id, confirming, remarks.trim());
      setApp(updated);
      setRemarks("");
      setFlash(successMessage(confirming, updated));
      window.scrollTo({ top: 0 });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  const dialog = () => {
    const next = nextDepartment(app.currentDepartment);
    if (confirming === "reject")
      return {
        title: "Reject this application?",
        message: "This stops the workflow. Your remarks will be saved in the history.",
        confirmLabel: "Reject",
        tone: "bad",
      };
    if (confirming === "return")
      return {
        title: "Return for correction?",
        message: `The application will return to ${DEPT_LABEL[FLOW[FLOW.indexOf(app.currentDepartment) - 1]]} for correction.`,
        confirmLabel: "Return",
        tone: "warn",
      };
    return {
      title: `${approveLabel(app)} this application?`,
      message: next
        ? `It will move on to ${DEPT_LABEL[next]}.`
        : "This is the final stage. The dealer will be marked as approved.",
      confirmLabel: approveLabel(app),
      tone: "ok",
    };
  };

  if (loading) return <div className="mx-auto max-w-3xl"><Skeleton rows={4} /></div>;
  if (error)
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <ErrorBanner message={error} onRetry={load} />
        <Link to="/applications" className="btn btn-outline">Back to queue</Link>
      </div>
    );

  const actionable = canAct(app, user);
  const d = confirming ? dialog() : null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="space-y-4 pb-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/applications" className="btn btn-outline min-w-12 px-3" aria-label="Back to queue">
            ‹ Queue
          </Link>
          <StatusBadge status={app.status} />
        </div>

        <SuccessBanner message={flash} onClose={() => setFlash("")} />

        <div>
          <h1 className="break-words text-2xl font-bold">{app.dealer}</h1>
          <p className="break-words text-mut">
            Applicant: {app.name} · {formatDate(app.date)}
          </p>
          {isActive(app) && (
            <p className="text-mut">
              Current stage: <span className="font-semibold text-brand">{DEPT_LABEL[app.currentDepartment]}</span>
            </p>
          )}
        </div>

        {canEdit(app, user) && (
          <Link to={`/applications/${app._id}/edit`} className="btn btn-outline">
            Edit details
          </Link>
        )}

        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Workflow progress</h2>
          <WorkflowStepper app={app} />
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Approval history</h2>
          <HistoryTimeline app={app} />
        </section>

        {!actionable && isActive(app) && (
          <p className="text-mut">
            Waiting for {DEPT_LABEL[app.currentDepartment]}. You can view this application but not act on it.
          </p>
        )}
      </div>

      {actionable && (
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-side px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:mx-0 md:rounded-t-xl md:border-x">
          {actionError && (
            <div className="mb-2">
              <ErrorBanner message={actionError} />
            </div>
          )}
          <label htmlFor="remarks" className="label">
            Remarks (required to reject or return)
          </label>
          <textarea
            id="remarks"
            rows={1}
            maxLength={500}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="field max-h-32 resize-none py-2.5 [field-sizing:content]"
          />
          <div className={`mt-2 grid gap-2 ${canReturn(app, user) ? "grid-cols-3" : "grid-cols-2"}`}>
            <button type="button" onClick={() => askConfirm("approve")} className="btn bg-ok px-1 text-canvas">
              {approveLabel(app)}
            </button>
            {canReturn(app, user) && (
              <button type="button" onClick={() => askConfirm("return")} className="btn border-warn px-1 text-warn">
                Return
              </button>
            )}
            <button type="button" onClick={() => askConfirm("reject")} className="btn border-bad px-1 text-bad">
              Reject
            </button>
          </div>
        </div>
      )}

      {d && (
        <ConfirmDialog
          {...d}
          remarks={confirming === "approve" ? "" : remarks.trim()}
          busy={busy}
          onConfirm={runAction}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}
