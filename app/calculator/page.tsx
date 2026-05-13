import ManualRefundForm from "@/components/calculator/ManualRefundForm";

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            IRCTC Refund Calculator
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
            Calculate Railway Ticket Refund
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Enter your ticket details manually and get an estimated refund
            breakdown including cancellation charge, clerkage, GST, and final
            refund amount.
          </p>
        </div>

        <ManualRefundForm />
      </div>
    </main>
  );
}