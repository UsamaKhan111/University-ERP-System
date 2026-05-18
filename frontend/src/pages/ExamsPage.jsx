import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { examService } from "../services/examService";
import { resultService } from "../services/resultService";
import { studentService } from "../services/studentService";

const ExamsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [averageGPA, setAverageGPA] = useState({ averageGPA: 0, totalResults: 0 });
  const [subjects, setSubjects] = useState([]);
  const [examForm, setExamForm] = useState({
    courseId: "",
    examDate: new Date().toISOString().slice(0, 10),
    examType: "midterm",
    totalMarks: 100
  });
  const [resultForm, setResultForm] = useState({
    examId: "",
    obtainedMarks: "",
    studentId: ""
  });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadExamData = async () => {
    const examData = await examService.list({ limit: 100 });
    setExams(examData.exams);
  };

  const loadAnalytics = async () => {
    if (isStudent) {
      return;
    }

    const [top, summary, subjectData] = await Promise.all([
      resultService.getTopStudents(),
      resultService.getAverageGPA(),
      resultService.getSubjectPerformance()
    ]);

    setTopStudents(top);
    setAverageGPA(summary);
    setSubjects(subjectData);
  };

  const loadResults = async (studentId) => {
    if (!studentId) {
      setResults([]);
      return;
    }

    const studentResults = await resultService.getStudentResults(studentId);
    setResults(studentResults);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        if (isStudent) {
          const profile = await studentService.getMe();
          const studentResults = await resultService.getStudentResults(profile._id);

          if (isMounted) {
            setSelectedStudentId(profile._id);
            setResults(studentResults);
          }

          return;
        }

        const [courseData, studentData, examData, top, summary, subjectData] = await Promise.all([
          courseService.list({ limit: 100 }),
          studentService.list({ limit: 100 }),
          examService.list({ limit: 100 }),
          resultService.getTopStudents(),
          resultService.getAverageGPA(),
          resultService.getSubjectPerformance()
        ]);

        if (isMounted) {
          setCourses(courseData.courses);
          setStudents(studentData.students);
          setExams(examData.exams);
          setTopStudents(top);
          setAverageGPA(summary);
          setSubjects(subjectData);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load exam data");
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
  }, [isStudent]);

  const handleExamChange = (event) => {
    const { name, value } = event.target;
    setExamForm((current) => ({ ...current, [name]: value }));
  };

  const handleResultChange = (event) => {
    const { name, value } = event.target;
    setResultForm((current) => ({ ...current, [name]: value }));
  };

  const createExam = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await examService.create(examForm);
      setNotice("Exam scheduled successfully");
      await loadExamData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to schedule exam");
    } finally {
      setSaving(false);
    }
  };

  const publishResult = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await resultService.create(resultForm);
      setNotice("Result published successfully");
      await Promise.all([loadAnalytics(), loadResults(resultForm.studentId)]);
      setSelectedStudentId(resultForm.studentId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to publish result");
    } finally {
      setSaving(false);
    }
  };

  const handleStudentSelect = async (event) => {
    const studentId = event.target.value;
    setSelectedStudentId(studentId);
    setError("");

    try {
      await loadResults(studentId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load student results");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">Exams and Results</p>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Results</h1>
      </div>

      {notice ? <p className="rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-stone-500">Loading exams and results...</p> : null}

      {!isStudent ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
              <p className="text-sm font-medium text-stone-500">Average GPA</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{averageGPA.averageGPA || 0}</p>
            </article>
            <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
              <p className="text-sm font-medium text-stone-500">Published Results</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{averageGPA.totalResults || 0}</p>
            </article>
            <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
              <p className="text-sm font-medium text-stone-500">Subjects</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{subjects.length}</p>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={createExam}>
              <h2 className="text-base font-semibold text-ink">Schedule Exam</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="courseId" value={examForm.courseId} onChange={handleExamChange} required>
                  <option value="">Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.title}
                    </option>
                  ))}
                </select>
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="examType" value={examForm.examType} onChange={handleExamChange}>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="assignment">Assignment</option>
                  <option value="lab">Lab</option>
                </select>
                <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="1" max="1000" name="totalMarks" type="number" value={examForm.totalMarks} onChange={handleExamChange} required />
                <input className="rounded border border-stone-300 px-3 py-2 text-sm" name="examDate" type="date" value={examForm.examDate} onChange={handleExamChange} required />
              </div>
              <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-stone-300" type="submit" disabled={saving}>
                Schedule Exam
              </button>
            </form>

            <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={publishResult}>
              <h2 className="text-base font-semibold text-ink">Enter Marks</h2>
              <div className="mt-4 grid gap-3">
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="examId" value={resultForm.examId} onChange={handleResultChange} required>
                  <option value="">Exam</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.courseId?.courseCode || "Course"} - {exam.examType} - {exam.totalMarks}
                    </option>
                  ))}
                </select>
                <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="studentId" value={resultForm.studentId} onChange={handleResultChange} required>
                  <option value="">Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.registrationNumber} - {student.userId?.fullName || "Student"}
                    </option>
                  ))}
                </select>
                <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="0" name="obtainedMarks" type="number" value={resultForm.obtainedMarks} onChange={handleResultChange} placeholder="Obtained marks" required />
              </div>
              <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-stone-300" type="submit" disabled={saving}>
                Publish Result
              </button>
            </form>
          </div>

          <section className="rounded border border-stone-200 bg-white p-4 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Top Students</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topStudents.map((student) => (
                <div key={student.studentId} className="rounded border border-stone-200 p-3">
                  <p className="text-sm font-medium text-ink">{student.registrationNumber}</p>
                  <p className="mt-1 text-sm text-stone-500">GPA {student.averageGPA}</p>
                </div>
              ))}
              {topStudents.length === 0 ? <p className="text-sm text-stone-500">No result rankings yet.</p> : null}
            </div>
          </section>
        </>
      ) : null}

      {!isStudent ? (
        <label className="grid gap-1 text-sm font-medium text-ink sm:max-w-sm">
          Student result report
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
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Exam</th>
                <th className="px-4 py-3 font-semibold">Marks</th>
                <th className="px-4 py-3 font-semibold">Grade</th>
                <th className="px-4 py-3 font-semibold">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {results.map((result) => (
                <tr key={result._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-ink">{result.examId?.courseId?.courseCode || "Course"}</td>
                  <td className="px-4 py-3 capitalize text-stone-700">{result.examId?.examType || "Exam"}</td>
                  <td className="px-4 py-3 text-stone-700">{result.obtainedMarks}</td>
                  <td className="px-4 py-3 text-stone-700">{result.grade}</td>
                  <td className="px-4 py-3 text-stone-700">{result.GPA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && results.length === 0 ? <p className="px-4 py-5 text-sm text-stone-500">No results found.</p> : null}
      </section>
    </section>
  );
};

export default ExamsPage;
