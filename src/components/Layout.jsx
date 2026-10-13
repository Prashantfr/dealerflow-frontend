import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEPT_LABEL } from "../utils/workflow";

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  // While the mobile menu is open: Escape closes it and the page behind it doesn't scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const links = [
    { to: "/", label: "Dashboard", active: pathname === "/" },
    {
      to: "/applications",
      label: "Application queue",
      active: pathname.startsWith("/applications") && !pathname.startsWith("/applications/new"),
    },
    ...(user.role === "sales"
      ? [{ to: "/applications/new", label: "New application", active: pathname === "/applications/new" }]
      : []),
  ];

  return (
    <div className="min-h-dvh">
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col gap-1.5 border-r border-line bg-side p-3.5 md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full max-md:invisible"
        }`}
      >
        <div className="px-2 pb-4 pt-2 text-xl font-bold">DealerFlow</div>
        <nav aria-label="Main" className="flex flex-col gap-1.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={l.active ? "page" : undefined}
              className={`flex min-h-12 items-center rounded-lg border-l-4 px-3 ${
                l.active
                  ? "border-brand bg-sel font-bold text-white"
                  : "border-transparent text-mut hover:bg-white/5 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-line p-3 text-sm md:hidden">
          <p className="font-semibold">{user.name}</p>
          <p className="text-mut">{DEPT_LABEL[user.role] || user.role}</p>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col md:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 pb-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="sidebar"
              className="btn btn-outline min-w-12 px-0 text-xl md:hidden"
            >
              ☰
            </button>
            <span className="truncate text-lg font-bold md:hidden">DealerFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-semibold leading-tight">{user.name}</p>
              <p className="text-sm leading-tight text-mut">{DEPT_LABEL[user.role] || user.role} department</p>
            </div>
            <button type="button" onClick={logout} className="btn btn-outline min-h-11">
              Log out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pt-5 md:px-8 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
