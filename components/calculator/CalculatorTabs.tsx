"use client";

import { useState } from "react";
import ManualRefundForm from "./ManualRefundForm";
import PnrRefundForm from "./PnrRefundForm";

type CalculatorMode = "manual" | "pnr";

export default function CalculatorTabs() {
  const [mode, setMode] = useState<CalculatorMode>("manual");

  return (
    <div>
      <div className="mx-auto mb-8 flex max-w-md rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === "manual"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Manual Calculator
        </button>

        <button
          type="button"
          onClick={() => setMode("pnr")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === "pnr"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          PNR Calculator
        </button>
      </div>

      {mode === "manual" ? <ManualRefundForm /> : <PnrRefundForm />}
    </div>
  );
}