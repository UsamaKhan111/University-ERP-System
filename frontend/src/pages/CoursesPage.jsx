import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { studentService } from "../services/studentService";
import { teacherService } from "../services/teacherService";

const CoursesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollmentStats, setEnrollmentStats] = useState([]);
  const [teacherStats, setTeacherStats] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ limit: 10, page: 1, search: "", semester: "" });
  const [formFilters, setFormFilters] = useState({ search: "", semester: "" });
  const [courseForm, setCourseForm] = useState({
    courseCode: "",
    creditHours: 3,
    semester: 1,
    teacherId: "",
    title: ""
  });
  const [enrollmentForm, setEnrollmentForm] = useState({ courseId: "", studentId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const [courseData, enrollments, teacherCounts] = await Promise.all([
        courseService.list(filters),
        user?.role === "student" ? Promise.resolve([]) : courseService.getEnrollmentStats(),
        user?.role === "student" ? Promise.resolve([]) : courseService.getTeacherStats()
      ]);

      setCourses(courseData.courses);
      setPagination(courseData.pagination);
      setEnrollmentStats(enrollments);
      setTeacherStats(teacherCounts);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [filters]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let isMounted = true;

    const loadReferenceData = async () => {
      try {
        const [teacherData, studentData] = await Promise.all([
          teacherService.list({ limit: 100 }),
          studentService.list({ limit: 100 })
        ]);

        if (isMounted) {
          setTeachers(teacherData.teachers);
          setStudents(studentData.students);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load course form data");
        }
      }
    };

    loadReferenceData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFormFilters((current) => ({ ...current, [name]: value }));
  };

  const submitFilters = (event) => {
    event.preventDefault();
    setFilters((current) => ({ ...current, ...formFilters, page: 1 }));
  };

  const clearFilters = () => {
    const nextFilters = { search: "", semester: "" };
    setFormFilters(nextFilters);
    setFilters((current) => ({ ...current, ...nextFilters, page: 1 }));
  };

  const handleCourseFormChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((current) => ({ ...current, [name]: value }));
  };

  const handleEnrollmentFormChange = (event) => {
    const { name, value } = event.target;
    setEnrollmentForm((current) => ({ ...current, [name]: value }));
  };

  const createCourse = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await courseService.create(courseForm);
      setCourseForm({ courseCode: "", creditHours: 3, semester: 1, teacherId: "", title: "" });
      setNotice("Course created successfully");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create course");
    } finally {
      setSaving(false);
    }
  };

  const createEnrollment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await enrollmentService.create(enrollmentForm);
      setEnrollmentForm({ courseId: "", studentId: "" });
      setNotice("Student enrolled successfully");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to enroll student");
    } finally {
      setSaving(false);
    }
  };

  const goToPage = (page) => {
    setFilters((current) => ({ ...current, page }));
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Course Management</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Courses</h1>
        </div>
        <p className="text-sm text-stone-500">{pagination.total} total records</p>
      </div>

      {notice ? <p className="rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Enrollment Groups</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{enrollmentStats.length}</p>
        </article>
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Teaching Assignments</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{teacherStats.length}</p>
        </article>
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Current Page</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{pagination.page}</p>
        </article>
      </div>

      {isAdmin ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={createCourse}>
            <h2 className="text-base font-semibold text-ink">Create Course</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" name="title" value={courseForm.title} onChange={handleCourseFormChange} placeholder="Course title" required />
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" name="courseCode" value={courseForm.courseCode} onChange={handleCourseFormChange} placeholder="Course code" required />
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="1" max="12" name="semester" type="number" value={courseForm.semester} onChange={handleCourseFormChange} required />
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="1" max="6" name="creditHours" type="number" value={courseForm.creditHours} onChange={handleCourseFormChange} required />
              <select className="rounded border border-stone-300 px-3 py-2 text-sm sm:col-span-2" name="teacherId" value={courseForm.teacherId} onChange={handleCourseFormChange} required>
                <option value="">Assign teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.employeeId} - {teacher.userId?.fullName || teacher.department}
                  </option>
                ))}
              </select>
            </div>
            <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-stone-300" type="submit" disabled={saving}>
              Create Course
            </button>
          </form>

          <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={createEnrollment}>
            <h2 className="text-base font-semibold text-ink">Enroll Student</h2>
            <div className="mt-4 grid gap-3">
              <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="studentId" value={enrollmentForm.studentId} onChange={handleEnrollmentFormChange} required>
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.registrationNumber} - {student.userId?.fullName || student.department}
                  </option>
                ))}
              </select>
              <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="courseId" value={enrollmentForm.courseId} onChange={handleEnrollmentFormChange} required>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-stone-300" type="submit" disabled={saving}>
              Enroll Student
            </button>
          </form>
        </div>
      ) : null}

      <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={submitFilters}>
        <div className="grid gap-3 md:grid-cols-[1.4fr_160px_auto_auto] md:items-end">
          <label className="grid gap-1 text-sm font-medium text-ink">
            Search
            <input className="rounded border border-stone-300 px-3 py-2 text-sm" name="search" value={formFilters.search} onChange={handleFilterChange} placeholder="Title or course code" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            Semester
            <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="1" max="12" name="semester" type="number" value={formFilters.semester} onChange={handleFilterChange} />
          </label>
          <button className="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" type="submit">Search</button>
          <button className="rounded border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      <section className="overflow-hidden rounded border border-stone-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Semester</th>
                <th className="px-4 py-3 font-semibold">Credits</th>
                <th className="px-4 py-3 font-semibold">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-ink">{course.courseCode}</td>
                  <td className="px-4 py-3 text-stone-700">{course.title}</td>
                  <td className="px-4 py-3 text-stone-700">{course.semester}</td>
                  <td className="px-4 py-3 text-stone-700">{course.creditHours}</td>
                  <td className="px-4 py-3 text-stone-700">
                    {course.teacherId?.userId?.fullName || course.teacherId?.employeeId || "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? <p className="px-4 py-5 text-sm text-stone-500">Loading courses...</p> : null}
        {!loading && courses.length === 0 ? <p className="px-4 py-5 text-sm text-stone-500">No courses found.</p> : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 disabled:text-stone-300" type="button" disabled={pagination.page <= 1 || loading} onClick={() => goToPage(pagination.page - 1)}>
            Previous
          </button>
          <button className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 disabled:text-stone-300" type="button" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => goToPage(pagination.page + 1)}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoursesPage;
