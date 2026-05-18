const detailRows = [
  ["Registration", "registrationNumber"],
  ["Department", "department"],
  ["Semester", "semester"],
  ["Session", "session"],
  ["Guardian", "guardianName"],
  ["Phone", "phone"],
  ["Address", "address"]
];

const StudentProfilePanel = ({ student }) => {
  if (!student) {
    return null;
  }

  const user = student.userId || {};

  return (
    <section className="rounded border border-stone-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-1 border-b border-stone-200 pb-4">
        <p className="text-sm font-medium text-brand-700">{student.registrationNumber}</p>
        <h2 className="text-xl font-semibold text-ink">{user.fullName || "Student Profile"}</h2>
        <p className="text-sm text-stone-500">{user.email || "No account email"}</p>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {detailRows.map(([label, key]) => (
          <div key={key}>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{student[key] || "Not recorded"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default StudentProfilePanel;
