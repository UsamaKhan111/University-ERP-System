const AuthShell = ({ children, eyebrow, title }) => {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-ink sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Smart University ERP
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">
              Academic operations, secured by role.
            </h1>
            <div className="mt-8 grid gap-3">
              {["admin", "teacher", "student"].map((role) => (
                <div key={role} className="rounded border border-stone-200 bg-white px-4 py-3 shadow-panel">
                  <p className="text-sm font-medium capitalize text-ink">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded border border-stone-200 bg-white p-6 shadow-panel">
          <p className="text-sm font-medium text-brand-700">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{title}</h2>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </main>
  );
};

export default AuthShell;
