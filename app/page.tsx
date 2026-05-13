import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-16">
      <section className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Railway Ticket Refund Estimator
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Calculate your IRCTC ticket refund instantly
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Estimate cancellation charges, clerkage, GST, TDR cases, and final
              refund payable using a structured IRCTC refund rule engine.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/calculator"
                className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Start Calculator
              </Link>

              <Link
                href="/rules"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Refund Rules
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              What this calculator handles
            </h2>

            <div className="mt-5 grid gap-3">
              <Feature text="Confirmed ticket cancellation slabs" />
              <Feature text="RAC and waitlisted ticket clerkage" />
              <Feature text="Tatkal and Premium Tatkal handling" />
              <Feature text="Train cancellation full refund cases" />
              <Feature text="Train delayed more than 3 hours" />
              <Feature text="TDR-required special cases" />
              <Feature text="GST and final refund breakdown" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        ✓
      </span>
      <p className="text-sm font-medium text-slate-700">{text}</p>
    </div>
  );
}