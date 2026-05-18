import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { teacherService } from "../services/teacherService";

const emptyCreateForm = {
  fullName: "",
  email: "",
  password: "",
  employeeId: "",
  department: "",
  specialization: ""
};

const TeachersPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";
  const [dashboard, setDashboard] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [formFilters, setFormFilters] = useState({ department: "", search: "" });
  const [filters, setFilters] = useState({ department: "", limit: 10, page: 1, search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createNotice, setCreateNotice] = useState("");
  const [createError, setCreateError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editNotice, setEditNotice] = useState("");
  const [editError, setEditError] = useState("");

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

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  };

  const startEdit = (teacher) => {
    setEditingId(teacher._id);
    setEditForm({
      fullName: teacher.userId?.fullName || "",
      password: "",
      employeeId: teacher.employeeId || "",
      department: teacher.department || "",
      specialization: teacher.specialization || ""
    });
    setEditNotice("");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setEditNotice("");
    setEditError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingId || !editForm) return;
    setEditing(true);
    setEditNotice("");
    setEditError("");

    try {
      const payload = {
        fullName: editForm.fullName,
        employeeId: editForm.employeeId,
        department: editForm.department,
        specialization: editForm.specialization
      };
      if (editForm.password && editForm.password.length > 0) {
        payload.password = editForm.password;
      }
      await teacherService.update(editingId, payload);
      setEditNotice("Teacher updated");
      setEditingId(null);
      setEditForm(null);
      setFilters((current) => ({ ...current }));
    } catch (requestError) {
      setEditError(requestError.response?.data?.message || "Unable to update teacher");
    } finally {
      setEditing(false);
    }
  };

  const createTeacher = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateNotice("");
    setCreateError("");

    try {
      const registerResponse = await api.post("/api/auth/register", {
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        role: "teacher"
      });
      const newUserId = registerResponse.data.data.user._id;

      await teacherService.create({
        userId: newUserId,
        employeeId: createForm.employeeId,
        department: createForm.department,
        specialization: createForm.specialization
      });

      setCreateNotice(`Teacher ${createForm.employeeId} created`);
      setCreateForm(emptyCreateForm);
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (requestError) {
      setCreateError(requestError.response?.data?.message || "Unable to create teacher");
    } finally {
      setCreating(false);
    }
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

      {isAdmin ? (
        <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={createTeacher}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Add Teacher</h2>
            <p className="text-xs text-stone-500">Creates a user account and the linked teacher profile.</p>
          </div>
          {createNotice ? (
            <p className="mt-3 rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">{createNotice}</p>
          ) : null}
          {createError ? (
            <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium text-ink">
              Full name
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="fullName" value={createForm.fullName} onChange={handleCreateChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Email
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="email" type="email" value={createForm.email} onChange={handleCreateChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Password (min 8)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="password" type="password" minLength={8} value={createForm.password} onChange={handleCreateChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Employee ID
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="employeeId" value={createForm.employeeId} onChange={handleCreateChange} placeholder="e.g. EMP-1024" required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Department
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="department" value={createForm.department} onChange={handleCreateChange} placeholder="Computer Science" required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Specialization
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="specialization" value={createForm.specialization} onChange={handleCreateChange} placeholder="Databases / AI / ..." required />
            </label>
          </div>
          <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300" type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add Teacher"}
          </button>
        </form>
      ) : null}

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

      {editNotice ? (
        <p className="rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">{editNotice}</p>
      ) : null}

      {isAdmin && editingId && editForm ? (
        <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={submitEdit}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Edit Teacher</h2>
            <button className="text-sm text-stone-500 hover:text-ink" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
          {editError ? (
            <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium text-ink">
              Full name
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="fullName" value={editForm.fullName} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              New password (leave blank to keep current)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="password" type="password" minLength={8} value={editForm.password} onChange={handleEditChange} placeholder="Min 8 characters" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Employee ID
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="employeeId" value={editForm.employeeId} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Department
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="department" value={editForm.department} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Specialization
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="specialization" value={editForm.specialization} onChange={handleEditChange} required />
            </label>
          </div>
          <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300" type="submit" disabled={editing}>
            {editing ? "Saving..." : "Save changes"}
          </button>
        </form>
      ) : null}

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
                {isAdmin ? <th className="px-4 py-3 font-semibold">Actions</th> : null}
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
                  {isAdmin ? (
                    <td className="px-4 py-3">
                      <button className="font-medium text-brand-700 hover:text-brand-600" type="button" onClick={() => startEdit(teacher)}>
                        Edit
                      </button>
                    </td>
                  ) : null}
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
