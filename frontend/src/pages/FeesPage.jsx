import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { feeService } from "../services/feeService";
import { studentService } from "../services/studentService";

const FeesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [form, setForm] = useState({
    amount: "",
    dueDate: new Date().toISOString().slice(0, 10),
    paymentStatus: "pending",
    semester: 1,
    studentId: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadStudentFees = async (studentId) => {
    if (!studentId) {
      setFees([]);
      return;
    }

    const feeRecords = await feeService.getStudentFees(studentId);
    setFees(feeRecords);
  };

  const loadSummary = async () => {
    if (!isAdmin) {
      return;
    }

    const dueSummary = await feeService.getDueSummary();
    setSummary(dueSummary);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        if (isStudent) {
          const profile = await studentService.getMe();
          const feeRecords = await feeService.getStudentFees(profile._id);

          if (isMounted) {
            setSelectedStudentId(profile._id);
            setFees(feeRecords);
          }

          return;
        }

        if (!isAdmin) {
          if (isMounted) {
            setError("Fee records are available to admins and students only");
          }
          return;
        }

        const [studentData, dueSummary] = await Promise.all([
          studentService.list({ limit: 100 }),
          feeService.getDueSummary()
        ]);

        if (isMounted) {
          setStudents(studentData.students);
          setSummary(dueSummary);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load fee data");
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
  }, [isAdmin, isStudent]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const createFee = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await feeService.create(form);
      setNotice("Fee generated successfully");
      setForm((current) => ({ ...current, amount: "", paymentStatus: "pending" }));
      await Promise.all([loadSummary(), loadStudentFees(form.studentId)]);
      setSelectedStudentId(form.studentId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate fee");
    } finally {
      setSaving(false);
    }
  };

  const handleStudentSelect = async (event) => {
    const studentId = event.target.value;
    setSelectedStudentId(studentId);
    setReceipt(null);
    setError("");

    try {
      await loadStudentFees(studentId);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load fee records");
    }
  };

  const viewReceipt = async (feeId) => {
    setError("");

    try {
      const receiptData = await feeService.getReceipt(feeId);
      setReceipt(receiptData);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load receipt");
    }
  };

  const pendingAmount = fees
    .filter((fee) => fee.paymentStatus === "pending" || fee.paymentStatus === "overdue")
    .reduce((total, fee) => total + Number(fee.amount || 0), 0);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">Fee Management</p>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Fees</h1>
      </div>

      {notice ? <p className="rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-stone-500">Loading fee data...</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Payment Records</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{fees.length}</p>
        </article>
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Pending Amount</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{pendingAmount}</p>
        </article>
        <article className="rounded border border-stone-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-medium text-stone-500">Due Groups</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.length}</p>
        </article>
      </div>

      {isAdmin ? (
        <form className="rounded border border-stone-200 bg-white p-4 shadow-panel" onSubmit={createFee}>
          <h2 className="text-base font-semibold text-ink">Generate Fee</h2>
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
              Semester
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="1" max="12" name="semester" type="number" value={form.semester} onChange={handleChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Amount
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" min="0" name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="e.g. 45000" required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Due date
              <input className="rounded border border-stone-300 px-3 py-2 text-sm" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Payment status
              <select className="rounded border border-stone-300 px-3 py-2 text-sm" name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="waived">Waived</option>
              </select>
            </label>
          </div>
          <button className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-stone-300" type="submit" disabled={saving}>
            Generate Fee
          </button>
        </form>
      ) : null}

      {isAdmin ? (
        <label className="grid gap-1 text-sm font-medium text-ink sm:max-w-sm">
          Student fee history
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
                <th className="px-4 py-3 font-semibold">Semester</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {fees.map((fee) => (
                <tr key={fee._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-ink">{fee.semester}</td>
                  <td className="px-4 py-3 text-stone-700">{fee.amount}</td>
                  <td className="px-4 py-3 text-stone-700">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize text-stone-700">{fee.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <button className="font-medium text-brand-700 hover:text-brand-600" type="button" onClick={() => viewReceipt(fee._id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && fees.length === 0 ? <p className="px-4 py-5 text-sm text-stone-500">No fee records found.</p> : null}
      </section>

      {receipt ? (
        <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
          <p className="text-sm font-medium text-brand-700">Receipt</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{receipt.receiptNumber}</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Amount</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{receipt.fee.amount}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Status</dt>
              <dd className="mt-1 text-sm font-medium capitalize text-ink">{receipt.fee.paymentStatus}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Issued</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{new Date(receipt.issuedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </section>
  );
};

export default FeesPage;
