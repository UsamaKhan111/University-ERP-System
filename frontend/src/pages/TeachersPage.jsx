import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { teacherService } from "../services/teacherService";

const TeachersPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [dashboard, setDashboard] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [formFilters, setFormFilters] = useState({ department: "", search: "" });
  const [filters, setFilters] = useState({ department: "", limit: 10, page: 1, search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTeachers = async () => {
      setLoading(true);
      setError("");

      try {
        if (isTeacher) {
          const data = await teacherService.getDashboard();

          if (isMounted) {
            setDashboard(data);
          }

          return;
        }

        const data = await teacherService.list(filters);

        if (isMounted) {
          setTeachers(data.teachers);
          setPagination(data.pagination);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load teacher data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTeachers();

    return () => {
      isMounted = false;
    };
  }, [filters, isTeacher]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setFilters((current) => ({ ...current, ...formFilters, page: 1 }));
  };

  const clearFilters = () => {
    const nextFilters = { department: "", search: "" };
    setFormFilters(nextFilters);
    setFilters((current) => ({ ...current, ...nextFilters, page: 1 }));
  };

  const goToPage = (page) => {
    setFilters((current) => ({ ...current, page }));
  };

  if (isTeacher) {
    const teacher = dashboard?.teacher;
    const assignedCourses = dashboard?.assignedCourses || [];

    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-brand-700">Teacher Dashboard</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{teacher?.userId?.fullName || "My Classes"}</h1>
        </div>

        {loading ? <p className="text-sm text-stone-500">Loading dashboard...</p> : null}
        {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
                <p className="text-sm font-medium text-stone-500">Employee ID</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{teacher?.employeeId || "-"}</p>
              </article>
              <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
                <p className="text-sm font-medium text-stone-500">Assigned Courses</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{dashboard?.totals?.assignedCourses || 0}</p>
              </article>
              <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
                <p className="text-sm font-medium text-stone-500">Department</p>
                <p className="mt-2 text-lg font-semibold text-ink">{teacher?.department || "-"}</p>
              </article>
            </div>

            <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
              <h2 className="text-base font-semibold text-ink">Assigned Course View</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {assignedCourses.length > 0 ? (
                  assignedCourses.map((course) => (
                    <article key={course._id || course} className="rounded border border-stone-200 p-4">
                      <p className="text-sm font-medium text-ink">{course.courseCode || "Course Reference"}</p>
                      <p className="mt-2 text-sm text-stone-600">{course.title || course}</p>
                      {course.semester ? <p className="mt-1 text-xs text-stone-500">Semester {course.semester}</p> : null}
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No courses assigned yet.</p>
                )}
              </div>
            </section>

            <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
              <h2 className="text-base font-semibold text-ink">Student Listing Per Course</h2>
              <div className="mt-4 grid gap-4">
                {(dashboard?.rosters || []).map((roster) => (
                  <div key={roster.course?._id || roster.course} className="rounded border border-stone-200">
                    <div className="border-b border-stone-200 px-4 py-3">
                      <p className="text-sm font-medium text-ink">
                        {roster.course?.courseCode || "Course"} - {roster.course?.title || "Roster"}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                        <tbody className="divide-y divide-stone-200">
                          {roster.students.length > 0 ? (
                            roster.students.map((student) => (
                              <tr key={student._id}>
                                <td className="px-4 py-3 font-medium text-ink">{student.registrationNumber}</td>
                                <td className="px-4 py-3 text-stone-700">{student.userId?.fullName || "Student"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 py-3 text-sm text-stone-500">No enrolled students yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Teacher Management</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Teachers</h1>
        </div>
        <p className="text-sm text-stone-500">{pagination.total} total records</p>
      </div>

      <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={handleSearch}>
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto_auto] md:items-end">
          <label className="grid gap-1 text-sm font-medium text-ink">
            Search
            <input
              className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              name="search"
              value={formFilters.search}
              onChange={handleChange}
              placeholder="Employee ID or specialization"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Department
            <input
              className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              name="department"
              value={formFilters.department}
              onChange={handleChange}
              placeholder="Computer Science"
            />
          </label>
          <button className="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" type="submit">
            Search
          </button>
          <button
            className="rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-brand-600 hover:text-brand-700"
            type="button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded border border-stone-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Specialization</th>
                <th className="px-4 py-3 font-semibold">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-ink">{teacher.employeeId}</td>
                  <td className="px-4 py-3 text-stone-700">{teacher.userId?.fullName || "Not linked"}</td>
                  <td className="px-4 py-3 text-stone-700">{teacher.department}</td>
                  <td className="px-4 py-3 text-stone-700">{teacher.specialization}</td>
                  <td className="px-4 py-3 text-stone-700">{teacher.assignedCourses?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? <p className="px-4 py-5 text-sm text-stone-500">Loading teachers...</p> : null}
        {error ? <p className="mx-4 my-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && teachers.length === 0 ? (
          <p className="px-4 py-5 text-sm text-stone-500">No teachers found.</p>
        ) : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300"
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Previous
          </button>
          <button
            className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300"
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeachersPage;
