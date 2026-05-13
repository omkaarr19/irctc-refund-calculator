export default function RulesPage() {
  const rules = [
    {
      title: "Confirmed ticket: more than 48 hours",
      description:
        "Flat class-wise cancellation charge is deducted. Higher classes have higher charges.",
    },
    {
      title: "Confirmed ticket: 48 to 12 hours",
      description:
        "25% of fare is deducted, subject to the minimum flat cancellation charge.",
    },
    {
      title: "Confirmed ticket: 12 to 4 hours",
      description:
        "50% of fare is deducted, subject to the minimum flat cancellation charge.",
    },
    {
      title: "Confirmed ticket: less than 4 hours",
      description:
        "No refund is normally admissible for confirmed tickets after this window.",
    },
    {
      title: "RAC / Waitlisted ticket",
      description:
        "Refund is calculated after deducting clerkage if cancelled within the allowed time window.",
    },
    {
      title: "Train cancelled",
      description:
        "Full refund is applicable when the train is cancelled by railways.",
    },
    {
      title: "Train late more than 3 hours",
      description:
        "Full refund may apply if the passenger did not travel and TDR conditions are satisfied.",
    },
    {
      title: "TDR cases",
      description:
        "Diversion, short termination, partial cancellation, AC failure, and similar cases may require TDR filing.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Refund Rules
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
            IRCTC Refund Rule Summary
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            These rules are stored in the refund engine as configurable rule
            definitions so future updates can be added safely.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold text-slate-900">{rule.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {rule.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Important disclaimer</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            This application provides an estimated refund based on configured
            IRCTC refund rules. The final refund amount is decided by
            IRCTC/Indian Railways.
          </p>
        </div>
      </section>
    </main>
  );
}