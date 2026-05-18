import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { attendanceService } from "../services/attendanceService";
import { courseService } from "../services/courseService";
import { studentService } from "../services/studentService";
import { teacherService } from "../services/teacherService";

const AttendancePage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentRecords, setStudentRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [monthly, setMonthly] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    lectureDate: new Date().toISOString().slice(0, 10),
    status: "present",
    studentId: "",
    teacherId: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    if (isStudent) {
      return;
    }

    const [monthlyData, percentageData, defaulterData] = await Promise.all([
      attendanceService.getMonthly({}),
      attendanceService.getPercentages({}),
      attendanceService.getDefaulters({ threshold: 75 })
    ]);

    setMonthly(monthlyData);
    setPercentages(percentageData);
    setDefaulters(defaulterData);
  };

  const loadStudentRecords = async (studentId, page = 1) => {
    if (!studentId) {
      setStudentRecords([]);
      return;
    }

    const data = await attendanceService.getStudentAttendance(studentId, { page, limit: 10 });
    setStudentRecords(data.records);
    setPagination(data.pagination);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        if (isStudent) {
          const profile = await studentService.getMe();
          const data = await attendanceService.getStudentAttendance(profile._id, { limit: 10, page: 1 });

          if (isMounted) {
            setSelectedStudentId(profile._id);
            setStudentRecords(data.records);
            setPagination(data.pagination);
          }

          return;
        }

        const [courseData, studentData] = await Promise.all([
          courseService.list({ limit: 100 }),
          studentService.list({ limit: 100 })
        ]);

        let teacherData = { teachers: [] };
        let currentTeacher = null;

        if (isTeacher) {
          const dashboard = await teacherService.getDashboard();
          currentTeacher = dashboard.teacher;
        } else {
          teacherData = await teacherService.list({ limit: 100 });
        }

        if (isMounted) {
          setCourses(courseData.courses);
          setStudents(studentData.students);
          setTeachers(teacherData.teachers);
          setTeacherProfile(currentTeacher);
          setForm((current) => ({
            ...current,
            teacherId: currentTeacher?._id || ""
          }));
        }

        await loadAnalytics();
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load attendance data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [isStudent, isTeacher]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const markAttendance = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await attendanceService.mark(form);
      setNotice("Attendance marked successfully");
      await Promise.all([loadAnalytics(), loadStudentRecords(form.studentId, 1)]);
      setSelectedStudentId(form.studentId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleStudentSelect = async (event) => {
    const studentId = event.target.value;
    setSelectedStudentId(studentId);
    setError("");

    try {
      await loadStudentRecords(studentId, 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load student attendance");
    }
  };

  const goToPage = async (page) => {
    try {
      await loadStudentRecords(selectedStudentId, page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load student attendance");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">Attendance System</p>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Attendance</h1>
      </div>

      {notice ? <p className="rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-stone-500">Loading attendance data...</p> : null}

      {!isStudent ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
              <p className="text-sm font-medium text-stone-500">Monthly Buckets</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{monthly.length}</p>
            </article>
            <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
              <p className="text-sm font-medium text-stone-500">Percentage Rows</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{percentages.length}</p>
            </article>
            <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
              <p className="text-sm font-medium text-stone-500">Defaulters</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{defaulters.length}</p>
            </article>
          </div>

          <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={markAttendance}>
            <h2 className="text-base font-semibold text-ink">Mark Attendance</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              <label className="grid gap-1 text-sm font-medium text-ink">
                Student
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="studentId" value={form.studentId} onChange={handleChange} required>
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.registrationNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-ink">
                Course
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="courseId" value={form.courseId} onChange={handleChange} required>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-ink">
                Teacher
                {isTeacher ? (
                  <input className="rounded border border-stone-300 px-3 py-2 text-sm" value={teacherProfile?.employeeId || "Teacher"} disabled />
                ) : (
                  <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="teacherId" value={form.teacherId} onChange={handleChange} required>
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.employeeId}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <label className="grid gap-1 text-sm font-medium text-ink">
                Status
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="status" value={form.status} onChange={handleChange}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-ink">
                Lecture date
                <input className="rounded border border-stone-300 px-3 py-2 text-sm" name="lectureDate" type="date" value={form.lectureDate} onChange={handleChange} required />
              </label>
            </div>
            <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-stone-300" type="submit" disabled={saving}>
              Mark Attendance
            </button>
          </form>

          <section className="rounded border border-stone-200 bg-white p-4 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Attendance Analytics</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {percentages.slice(0, 6).map((row) => (
                <div key={row.studentId} className="rounded border border-stone-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{row.registrationNumber}</p>
                    <p className="text-sm text-stone-600">{row.attendancePercentage}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded bg-stone-100">
                    <div className="h-2 rounded bg-brand-600" style={{ width: `${Math.min(row.attendancePercentage, 100)}%` }} />
                  </div>
                </div>
              ))}
              {percentages.length === 0 ? <p className="text-sm text-stone-500">No attendance percentages yet.</p> : null}
            </div>
          </section>
        </>
      ) : null}

      {!isStudent ? (
        <label className="grid gap-1 text-sm font-medium text-ink sm:max-w-sm">
          Student attendance report
          <select className="rounded border border-stone-300 px-3 py-2 text-sm" value={selectedStudentId} onChange={handleStudentSelect}>
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.registrationNumber} - {student.userId?.fullName || "Student"}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <section className="overflow-hidden rounded border border-stone-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {studentRecords.map((record) => (
                <tr key={record._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-700">{new Date(record.lectureDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-ink">{record.courseId?.courseCode || "Course"}</td>
                  <td className="px-4 py-3 capitalize text-stone-700">{record.status}</td>
                  <td className="px-4 py-3 text-stone-700">{record.teacherId?.employeeId || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && studentRecords.length === 0 ? <p className="px-4 py-5 text-sm text-stone-500">No attendance records found.</p> : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 disabled:text-stone-300" type="button" disabled={pagination.page <= 1 || loading || !selectedStudentId} onClick={() => goToPage(pagination.page - 1)}>
            Previous
          </button>
          <button className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 disabled:text-stone-300" type="button" disabled={pagination.page >= pagination.totalPages || loading || !selectedStudentId} onClick={() => goToPage(pagination.page + 1)}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default AttendancePage;
