// The department order must match the `flow` array in the backend updateStatus controller.
export const FLOW = ["sales", "finance", "legal", "head"];

export const DEPT_LABEL = {
  sales: "Sales",
  finance: "Finance",
  legal: "Legal",
  head: "Head Office",
};

export const STATUS_LABEL = {
  pending: "In progress",
  returned: "Returned",
  approved: "Approved",
  rejected: "Rejected",
};

// Demo accounts created by the backend seed script (npm run seed)
export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Demo@1234";
export const DEMO_ROLES = [
  { role: "sales", label: "Sales", hint: "Create applications", email: "sales@dealerflow.demo" },
  { role: "finance", label: "Finance", hint: "Review stage 2", email: "finance@dealerflow.demo" },
  { role: "legal", label: "Legal", hint: "Review stage 3", email: "legal@dealerflow.demo" },
  { role: "head", label: "Head Office", hint: "Final approval", email: "head@dealerflow.demo" },
];

export const isActive = (app) => app.status === "pending" || app.status === "returned";

// Can this user act on this application right now?
export const canAct = (app, user) =>
  Boolean(app && user) && isActive(app) && app.currentDepartment === user.role;

// Backend rule: sales is the first stage and cannot return
export const canReturn = (app, user) => canAct(app, user) && user.role !== "sales";

// Sales can edit while the application is at the sales stage
export const canEdit = (app, user) => canAct(app, user) && user.role === "sales";

export const nextDepartment = (dept) => {
  const i = FLOW.indexOf(dept);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
};

export function approveLabel(app) {
  if (app.currentDepartment === "sales") return app.status === "returned" ? "Resubmit" : "Submit";
  return "Approve";
}

// Parse "YYYY-MM-DD" without timezone shifts
export function formatDate(value) {
  if (!value) return "-";
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return String(value);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayLocal() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
