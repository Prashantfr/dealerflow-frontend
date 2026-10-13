import { STATUS_LABEL } from "../utils/workflow";

// Colour rules: green = approved, red = rejected, amber = in progress / returned
const STYLE = {
  pending: "bg-warn/15 text-warn",
  returned: "bg-warn/15 text-warn",
  approved: "bg-ok/15 text-ok",
  rejected: "bg-bad/15 text-bad",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold ${
        STYLE[status] || "bg-line text-mut"
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}
