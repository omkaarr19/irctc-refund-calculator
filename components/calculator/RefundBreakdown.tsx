type RefundDeduction = {
  label: string;
  amount: number;
  reason: string;
};

export type RefundResult = {
  status: string;
  originalFare: number;
  cancellationCharge: number;
  clerkageCharge: number;
  gstAmount: number;
  totalDeduction: number;
  refundAmount: number;
  ruleApplied: string;
  explanation: string;
  deductions: RefundDeduction[];
};

export default function RefundBreakdown({
  result,
}: {
  result: RefundResult | null;
}) {
  if (!result) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Refund Breakdown
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Fill the ticket details and click calculate. Your refund estimate will
          appear here with full deduction details.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          No calculation yet.
        </div>
      </section>
    );
  }

  const statusColor =
    result.status === "FULL_REFUND"
      ? "bg-green-50 text-green-700"
      : result.status === "NO_REFUND"
      ? "bg-red-50 text-red-700"
      : result.status === "TDR_REQUIRED"
      ? "bg-amber-50 text-amber-700"
      : "bg-blue-50 text-blue-700";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Refund Breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Rule applied: {result.ruleApplied}
          </p>
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
        >
          {result.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <AmountRow label="Original Fare" value={result.originalFare} />
        <AmountRow
          label="Cancellation Charge"
          value={result.cancellationCharge}
        />
        <AmountRow label="Clerkage Charge" value={result.clerkageCharge} />
        <AmountRow label="GST" value={result.gstAmount} />
        <AmountRow label="Total Deduction" value={result.totalDeduction} />
      </div>

      <div className="mt-6 rounded-2xl bg-green-50 p-5">
        <p className="text-sm font-semibold text-green-700">
          Estimated Refund Payable
        </p>

        <p className="mt-2 text-4xl font-bold text-green-800">
          ₹{result.refundAmount.toFixed(2)}
        </p>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Explanation</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {result.explanation}
        </p>
      </div>

      {result.deductions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-900">Deduction Details</h3>

          <div className="mt-3 space-y-3">
            {result.deductions.map((deduction, index) => (
              <div
                key={`${deduction.label}-${index}`}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-800">
                    {deduction.label}
                  </p>

                  <p className="font-semibold text-slate-950">
                    ₹{deduction.amount.toFixed(2)}
                  </p>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {deduction.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">
        ₹{value.toFixed(2)}
      </span>
    </div>
  );
}