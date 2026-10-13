import { DEPT_LABEL, FLOW } from "../utils/workflow";

// Works out how each department step should look from the application state
function stepState(app, index) {
  const current = FLOW.indexOf(app.currentDepartment);
  if (app.status === "approved") return "done";
  if (index < current) return "done";
  if (index === current) {
    if (app.status === "rejected") return "rejected";
    if (app.status === "returned") return "returned";
    return "current";
  }
  return "todo";
}

const CIRCLE = {
  done: "bg-ok text-canvas",
  current: "bg-brand text-canvas",
  returned: "bg-warn text-canvas",
  rejected: "bg-bad text-canvas",
  todo: "border border-line-strong text-mut",
};
const ICON = { done: "✓", rejected: "✕", returned: "↩" };

export default function WorkflowStepper({ app }) {
  return (
    <ol className="flex" aria-label="Workflow progress">
      {FLOW.map((dept, i) => {
        const state = stepState(app, i);
        const lineDone = stepState(app, i - 1) === "done";
        return (
          <li
            key={dept}
            aria-current={state === "current" ? "step" : undefined}
            className="relative min-w-0 flex-1 text-center text-sm"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute -left-1/2 top-3.5 h-0.5 w-full ${lineDone ? "bg-ok" : "bg-line"}`}
              />
            )}
            <span
              className={`relative mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full font-bold ${CIRCLE[state]}`}
            >
              {ICON[state] || i + 1}
            </span>
            <span className={state === "current" ? "font-bold text-ink" : "text-mut"}>
              {DEPT_LABEL[dept]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
