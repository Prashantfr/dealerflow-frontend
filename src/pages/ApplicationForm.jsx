import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createAppointment, fetchAppointment, updateAppointment } from "../api/appointments";
import { getErrorMessage } from "../api/client";
import { ErrorBanner, Skeleton } from "../components/Feedback";
import { canEdit, todayLocal } from "../utils/workflow";

// One form for both "New application" and "Edit application"
export default function ApplicationForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", dealer: "", date: todayLocal() });
  const [loading, setLoading] = useState(editing);
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    fetchAppointment(id)
      .then((app) => {
        if (!canEdit(app, user)) setBlocked(true);
        setForm({ name: app.name, dealer: app.dealer, date: app.date });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [editing, id, user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.dealer.trim() || !form.date) {
      return setError("Applicant name, dealer name and date are all required.");
    }
    setSaving(true);
    setError("");
    try {
      const body = { name: form.name.trim(), dealer: form.dealer.trim(), date: form.date };
      if (editing) {
        await updateAppointment(id, body);
        navigate(`/applications/${id}`, { state: { flash: "Changes saved." } });
      } else {
        const created = await createAppointment(body);
        navigate(`/applications/${created._id}`, {
          state: { flash: "Application created. Submit it to send it to Finance." },
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-xl"><Skeleton rows={3} /></div>;

  if (blocked)
    return (
      <div className="card mx-auto max-w-xl text-center">
        <p className="text-lg font-semibold">This application can no longer be edited</p>
        <p className="mt-1 text-mut">Only applications at the Sales stage can be changed.</p>
        <Link to={`/applications/${id}`} className="btn btn-outline mt-4">
          Back to application
        </Link>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-8">
      <h1 className="text-2xl font-bold">{editing ? "Edit application" : "New application"}</h1>
      <form onSubmit={onSubmit} className="card flex flex-col gap-4" noValidate>
        <ErrorBanner message={error} />
        <div>
          <label htmlFor="name" className="label">Applicant name</label>
          <input id="name" value={form.name} onChange={set("name")} className="field" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="dealer" className="label">Dealer name</label>
          <input id="dealer" value={form.dealer} onChange={set("dealer")} className="field" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="date" className="label">Date</label>
          <input id="date" type="date" value={form.date} onChange={set("date")} className="field" />
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to={editing ? `/applications/${id}` : "/applications"} className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : editing ? "Save changes" : "Create application"}
          </button>
        </div>
      </form>
    </div>
  );
}
