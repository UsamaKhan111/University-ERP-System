import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentProfilePanel from "../components/StudentProfilePanel";
import { studentService } from "../services/studentService";

const StudentProfilePage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStudent = async () => {
      setLoading(true);
      setError("");

      try {
        const nextStudent = await studentService.getById(id);

        if (isMounted) {
          setStudent(nextStudent);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load student profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <Link className="text-sm font-medium text-brand-700 hover:text-brand-600" to="/students">
          Back to students
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">Student Profile</h1>
      </div>

      {loading ? <p className="text-sm text-stone-500">Loading student profile...</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {!loading && !error ? <StudentProfilePanel student={student} /> : null}
    </section>
  );
};

export default StudentProfilePage;
