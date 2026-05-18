import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StudentProfilePanel from "../components/StudentProfilePanel";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { studentService } from "../services/studentService";

const emptyCreateForm = {
  fullName: "",
  email: "",
  password: "",
  registrationNumber: "",
  department: "",
  semester: 1,
  session: "",
  guardianName: "",
  phone: "",
  address: ""
};

const defaultPagination = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 1
};

const StudentsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const [formFilters, setFormFilters] = useState({
    department: "",
    search: "",
    semester: ""
  });
  const [filters, setFilters] = useState({
    department: "",
    limit: 10,
    page: 1,
    search: "",
    semester: ""
  });
  const [students, setStudents] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [semesterStats, setSemesterStats] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
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

  const activeFilterCount = useMemo(() => {
    return ["department", "search", "semester"].filter((key) => Boolean(filters[key])).length;
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    const loadStudentData = async () => {
      setLoading(true);
      setError("");

      try {
        if (isStudent) {
          const student = await studentService.getMe();

          if (isMounted) {
            setMyProfile(student);
          }

          return;
        }

        const [listData, departments, semesters] = await Promise.all([
          studentService.list(filters),
          studentService.getDepartmentStats(),
          studentService.getSemesterStats()
        ]);

        if (isMounted) {
          setStudents(listData.students);
          setPagination(listData.pagination);
          setDepartmentStats(departments);
          setSemesterStats(semesters);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load student data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudentData();

    return () => {
      isMounted = false;
    };
  }, [filters, isStudent]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFormFilters((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters((current) => ({
      ...current,
      ...formFilters,
      page: 1
    }));
  };

  const clearFilters = () => {
    const nextFilters = {
      department: "",
      search: "",
      semester: ""
    };

    setFormFilters(nextFilters);
    setFilters((current) => ({
      ...current,
      ...nextFilters,
      page: 1
    }));
  };

  const goToPage = (page) => {
    setFilters((current) => ({
      ...current,
      page
    }));
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({ ...current, [name]: value }));
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setEditForm({
      fullName: student.userId?.fullName || "",
      password: "",
      registrationNumber: student.registrationNumber || "",
      department: student.department || "",
      semester: student.semester || 1,
      session: student.session || "",
      guardianName: student.guardianName || "",
      phone: student.phone || "",
      address: student.address || ""
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
        registrationNumber: editForm.registrationNumber,
        department: editForm.department,
        semester: Number(editForm.semester),
        session: editForm.session,
        guardianName: editForm.guardianName,
        phone: editForm.phone,
        address: editForm.address
      };
      if (editForm.password && editForm.password.length > 0) {
        payload.password = editForm.password;
      }
      await studentService.update(editingId, payload);
      setEditNotice("Student updated");
      setEditingId(null);
      setEditForm(null);
      setFilters((current) => ({ ...current }));
    } catch (requestError) {
      setEditError(requestError.response?.data?.message || "Unable to update student");
    } finally {
      setEditing(false);
    }
  };

  const createStudent = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateNotice("");
    setCreateError("");

    try {
      const registerResponse = await api.post("/api/auth/register", {
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        role: "student"
      });
      const newUserId = registerResponse.data.data.user._id;

      await studentService.create({
        userId: newUserId,
        registrationNumber: createForm.registrationNumber,
        department: createForm.department,
        semester: Number(createForm.semester),
        session: createForm.session,
        guardianName: createForm.guardianName,
        phone: createForm.phone,
        address: createForm.address
      });

      setCreateNotice(`Student ${createForm.registrationNumber} created`);
      setCreateForm(emptyCreateForm);
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (requestError) {
      setCreateError(requestError.response?.data?.message || "Unable to create student");
    } finally {
      setCreating(false);
    }
  };

  if (isStudent) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-brand-700">Student Dashboard</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">My Profile</h1>
        </div>

        {loading ? <p className="text-sm text-stone-500">Loading profile...</p> : null}
        {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {!loading && !error ? <StudentProfilePanel student={myProfile} /> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Student Management</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Students</h1>
        </div>
        <p className="text-sm text-stone-500">{pagination.total} total records</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Departments</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{departmentStats.length}</p>
        </article>
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Semester Groups</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{semesterStats.length}</p>
        </article>
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Active Filters</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{activeFilterCount}</p>
        </article>
      </div>

      {isAdmin ? (
        <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={createStudent}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Add Student</h2>
            <p className="text-xs text-stone-500">Creates a user account and the linked student profile.</p>
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
              Registration number
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="registrationNumber" value={createForm.registrationNumber} onChange={handleCreateChange} placeholder="e.g. CS-2024-001" required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Department
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="department" value={createForm.department} onChange={handleCreateChange} placeholder="Computer Science" required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Semester
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="semester" type="number" min="1" max="12" value={createForm.semester} onChange={handleCreateChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Session
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="session" value={createForm.session} onChange={handleCreateChange} placeholder="2024-2028" required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Guardian name (optional)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="guardianName" value={createForm.guardianName} onChange={handleCreateChange} />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Phone (optional)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="phone" value={createForm.phone} onChange={handleCreateChange} />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink md:col-span-3">
              Address (optional)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="address" value={createForm.address} onChange={handleCreateChange} />
            </label>
          </div>
          <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300" type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add Student"}
          </button>
        </form>
      ) : null}

      <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_160px_auto_auto] md:items-end">
          <label className="grid gap-1 text-sm font-medium text-ink">
            Search
            <input
              className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              name="search"
              value={formFilters.search}
              onChange={handleFilterChange}
              placeholder="Registration, department, session"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Department
            <input
              className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              name="department"
              value={formFilters.department}
              onChange={handleFilterChange}
              placeholder="Computer Science"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Semester
            <input
              className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              min="1"
              max="12"
              name="semester"
              type="number"
              value={formFilters.semester}
              onChange={handleFilterChange}
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
            <h2 className="text-base font-semibold text-ink">Edit Student</h2>
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
              Registration number
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="registrationNumber" value={editForm.registrationNumber} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Department
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="department" value={editForm.department} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Semester
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="semester" type="number" min="1" max="12" value={editForm.semester} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Session
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="session" value={editForm.session} onChange={handleEditChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Guardian name (optional)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="guardianName" value={editForm.guardianName} onChange={handleEditChange} />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Phone (optional)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="phone" value={editForm.phone} onChange={handleEditChange} />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink md:col-span-3">
              Address (optional)
              <input className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" name="address" value={editForm.address} onChange={handleEditChange} />
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
                <th className="px-4 py-3 font-semibold">Registration</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Semester</th>
                <th className="px-4 py-3 font-semibold">Session</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-ink">{student.registrationNumber}</td>
                  <td className="px-4 py-3 text-stone-700">{student.userId?.fullName || "Not linked"}</td>
                  <td className="px-4 py-3 text-stone-700">{student.department}</td>
                  <td className="px-4 py-3 text-stone-700">{student.semester}</td>
                  <td className="px-4 py-3 text-stone-700">{student.session}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link className="font-medium text-brand-700 hover:text-brand-600" to={`/students/${student._id}`}>
                        View
                      </Link>
                      {isAdmin ? (
                        <button className="font-medium text-brand-700 hover:text-brand-600" type="button" onClick={() => startEdit(student)}>
                          Edit
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? <p className="px-4 py-5 text-sm text-stone-500">Loading students...</p> : null}
        {error ? <p className="mx-4 my-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && students.length === 0 ? (
          <p className="px-4 py-5 text-sm text-stone-500">No students found.</p>
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

export default StudentsPage;
