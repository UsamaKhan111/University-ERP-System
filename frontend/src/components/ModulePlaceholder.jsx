const ModulePlaceholder = ({ title, collection }) => {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">Collection: {collection}</p>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      </div>

      <div className="rounded border border-stone-200 bg-white p-5 shadow-panel">
        <div className="grid gap-3 sm:grid-cols-3">
          {["Schema", "Routes", "Controllers"].map((item) => (
            <div key={item} className="rounded border border-stone-200 px-4 py-3">
              <p className="text-sm font-medium text-ink">{item}</p>
              <p className="mt-1 text-xs text-stone-500">Scheduled for upcoming sprint</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulePlaceholder;
