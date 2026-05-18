import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <section className="w-full max-w-md rounded border border-stone-200 bg-white p-6 text-center shadow-panel">
        <p className="text-sm font-medium text-brand-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Page not found</h1>
        <Link
          to="/"
          className="mt-6 inline-flex rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
