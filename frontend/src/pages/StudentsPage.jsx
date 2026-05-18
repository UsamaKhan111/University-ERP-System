import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StudentProfilePanel from "../components/StudentProfilePanel";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";

const defaultPagination = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 1
};

const StudentsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
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
                <th className="px-4 py-3 font-semibold">Profile</th>
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
                    <Link className="font-medium text-brand-700 hover:text-brand-600" to={`/students/${student._id}`}>
                      View
                    </Link>
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
