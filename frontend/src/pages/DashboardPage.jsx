import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { analyticsService } from "../services/analyticsService";

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [analytics, setAnalytics] = useState({
    attendanceTrends: [],
    departments: [],
    gpa: [],
    revenue: [],
    studentGrowth: []
  });
  const [loading, setLoading] = useState(isAdmin);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await analyticsService.getDashboard();

        if (isMounted) {
          setAnalytics(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load analytics dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const totalStudents = analytics.departments.reduce((total, row) => total + Number(row.totalStudents || 0), 0);
  const totalRevenue = analytics.revenue.reduce((total, row) => total + Number(row.totalAmount || 0), 0);
  const totalAttendance = analytics.attendanceTrends.reduce((total, row) => total + Number(row.totalMarked || 0), 0);
  const totalResults = analytics.gpa.reduce((total, row) => total + Number(row.totalResults || 0), 0);
  const stats = [
    { label: "Students", value: totalStudents, detail: "Department grouped" },
    { label: "Attendance", value: totalAttendance, detail: "Marked records" },
    { label: "Revenue", value: totalRevenue, detail: "Fee pipeline" },
    { label: "Results", value: totalResults, detail: "GPA records" }
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-brand-700">{isAdmin ? "Analytics Dashboard" : "Dashboard"}</p>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">University ERP Overview</h1>
      </div>

      {loading ? <p className="text-sm text-stone-500">Loading analytics...</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded border border-stone-200 bg-white p-5 shadow-panel">
            <p className="text-sm font-medium text-stone-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-stone-500">{stat.detail}</p>
          </article>
        ))}
      </div>

      {isAdmin ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Department-Wise Students</h2>
            <div className="mt-4 grid gap-3">
              {analytics.departments.map((row) => (
                <div key={row.department}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{row.department}</span>
                    <span className="text-stone-500">{row.totalStudents}</span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-stone-100">
                    <div
                      className="h-2 rounded bg-brand-600"
                      style={{ width: `${totalStudents ? (row.totalStudents / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {analytics.departments.length === 0 ? <p className="text-sm text-stone-500">No student analytics yet.</p> : null}
            </div>
          </section>

          <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Fee Collection Stats</h2>
            <div className="mt-4 grid gap-3">
              {analytics.revenue.map((row) => (
                <div key={row.paymentStatus} className="flex items-center justify-between rounded border border-stone-200 px-4 py-3">
                  <span className="text-sm font-medium capitalize text-ink">{row.paymentStatus}</span>
                  <span className="text-sm text-stone-600">{row.totalAmount}</span>
                </div>
              ))}
              {analytics.revenue.length === 0 ? <p className="text-sm text-stone-500">No fee analytics yet.</p> : null}
            </div>
          </section>

          <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Attendance Trends</h2>
            <div className="mt-4 grid gap-3">
              {analytics.attendanceTrends.map((row) => (
                <div key={`${row.year}-${row.month}`} className="rounded border border-stone-200 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">
                      {row.month}/{row.year}
                    </span>
                    <span className="text-stone-500">{row.totalMarked} marked</span>
                  </div>
                </div>
              ))}
              {analytics.attendanceTrends.length === 0 ? <p className="text-sm text-stone-500">No attendance trends yet.</p> : null}
            </div>
          </section>

          <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-ink">GPA Analytics</h2>
            <div className="mt-4 grid gap-3">
              {analytics.gpa.map((row) => (
                <div key={row.grade} className="rounded border border-stone-200 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">Grade {row.grade}</span>
                    <span className="text-stone-500">Avg {row.averageGPA}</span>
                  </div>
                </div>
              ))}
              {analytics.gpa.length === 0 ? <p className="text-sm text-stone-500">No GPA analytics yet.</p> : null}
            </div>
          </section>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
          <h2 className="text-base font-semibold text-ink">System Modules</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["Authentication", "Students", "Teachers", "Courses", "Attendance", "Results", "Fees", "Analytics"].map((item) => (
              <div key={item} className="rounded border border-stone-200 px-4 py-3">
                <p className="text-sm font-medium text-ink">{item}</p>
                <p className="mt-1 text-xs text-brand-700">Active</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
          <h2 className="text-base font-semibold text-ink">System Roles</h2>
          <div className="mt-4 grid gap-3">
            {["admin", "teacher", "student"].map((role) => (
              <div key={role} className="flex items-center justify-between rounded border border-stone-200 px-4 py-3">
                <span className="text-sm font-medium capitalize text-ink">{role}</span>
                <span className="text-xs text-stone-500">JWT protected</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default DashboardPage;
