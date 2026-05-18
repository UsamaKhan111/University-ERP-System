import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Students", path: "/students" },
  { label: "Teachers", path: "/teachers" },
  { label: "Courses", path: "/courses" },
  { label: "Attendance", path: "/attendance" },
  { label: "Exams", path: "/exams" },
  { label: "Fees", path: "/fees" }
];

const SidebarLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-ink">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-stone-200 bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-6 px-4 py-5">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand-600 text-sm font-bold text-white">
                ERP
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                  Smart University
                </p>
                <p className="text-xs text-stone-500">Academic Operations</p>
              </div>
            </div>

            <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto rounded border border-stone-200 bg-stone-50 p-3">
              <p className="truncate text-sm font-medium text-ink">{user?.fullName || "ERP User"}</p>
              <p className="mt-1 text-xs capitalize text-stone-500">{user?.role || "student"}</p>
              <button
                className="mt-3 w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-brand-600 hover:text-brand-700"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
