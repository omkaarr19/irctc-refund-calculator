export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          About
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          IRCTC Refund Calculator Platform
        </h1>

        <p className="mt-5 leading-7 text-slate-600">
          This web application is designed to estimate railway ticket refund
          amounts after cancellation. It uses a modular refund engine that
          separates IRCTC rule configuration from business logic, making the
          system easier to update when refund rules change.
        </p>

        <p className="mt-4 leading-7 text-slate-600">
          The current version supports manual refund calculation. Upcoming
          versions will include PNR-based auto-fetch, calculation history,
          provider fallback, and admin-managed rule versions.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-50 p-5">
          <h2 className="font-semibold text-slate-900">Current status</h2>

          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
            <li>Manual refund calculator completed</li>
            <li>Backend calculation API completed</li>
            <li>Rule-based refund engine added</li>
            <li>PNR auto-fetch pending</li>
            <li>Database and history pending</li>
          </ul>
        </div>
      </section>
    </main>
  );
}