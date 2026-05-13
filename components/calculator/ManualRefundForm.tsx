"use client";

import { useState } from "react";
import RefundBreakdown, { RefundResult } from "./RefundBreakdown";

type ApiResponse =
  | {
      success: true;
      result: RefundResult;
    }
  | {
      success: false;
      error: string;
    };

export default function ManualRefundForm() {
  const [result, setResult] = useState<RefundResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData(event.currentTarget);

    const scheduledDepartureValue = String(formData.get("scheduledDeparture"));
    const cancellationTimeValue = String(formData.get("cancellationTime"));

    const payload = {
      bookingClass: String(formData.get("bookingClass")),
      ticketStatus: String(formData.get("ticketStatus")),
      quota: String(formData.get("quota")),
      farePaid: Number(formData.get("farePaid")),
      passengerCount: Number(formData.get("passengerCount")),
      scheduledDeparture: new Date(scheduledDepartureValue).toISOString(),
      cancellationTime: new Date(cancellationTimeValue).toISOString(),
      chartPrepared: formData.get("chartPrepared") === "yes",
      journeyEvent: String(formData.get("journeyEvent")),
      passengerNotTravelled: formData.get("passengerNotTravelled") === "yes",
      tdrFiledBeforeActualDeparture:
        formData.get("tdrFiledBeforeActualDeparture") === "yes",
    };

    try {
      const response = await fetch("/api/calculate-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setError(
          !data.success
            ? data.error
            : "Unable to calculate refund. Please check your inputs."
        );
        return;
      }

      setResult(data.result);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Manual Ticket Details
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Enter booking details exactly as per your ticket for a better refund
            estimate.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Booking Class">
            <select name="bookingClass" className="input" required>
              <option value="1A">1A - First AC</option>
              <option value="EC">EC - Executive Class</option>
              <option value="2A">2A - Second AC</option>
              <option value="FC">FC - First Class</option>
              <option value="3A">3A - Third AC</option>
              <option value="CC">CC - AC Chair Car</option>
              <option value="3E">3E - Third AC Economy</option>
              <option value="SL">SL - Sleeper</option>
              <option value="2S">2S - Second Sitting</option>
            </select>
          </Field>

          <Field label="Ticket Status">
            <select name="ticketStatus" className="input" required>
              <option value="CONFIRMED">Confirmed</option>
              <option value="RAC">RAC</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="PARTIALLY_CONFIRMED">
                Partially Confirmed
              </option>
            </select>
          </Field>

          <Field label="Quota">
            <select name="quota" className="input" required>
              <option value="GENERAL">General</option>
              <option value="TATKAL">Tatkal</option>
              <option value="PREMIUM_TATKAL">Premium Tatkal</option>
            </select>
          </Field>

          <Field label="Fare Paid">
            <input
              name="farePaid"
              type="number"
              min="1"
              step="0.01"
              className="input"
              required
              placeholder="Example: 2000"
            />
          </Field>

          <Field label="Passenger Count">
            <input
              name="passengerCount"
              type="number"
              min="1"
              max="6"
              defaultValue="1"
              className="input"
              required
            />
          </Field>

          <Field label="Chart Prepared?">
            <select name="chartPrepared" className="input" required>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>

          <Field label="Scheduled Departure">
            <input
              name="scheduledDeparture"
              type="datetime-local"
              className="input"
              required
            />
          </Field>

          <Field label="Cancellation Time">
            <input
              name="cancellationTime"
              type="datetime-local"
              className="input"
              required
            />
          </Field>

          <Field label="Journey Event">
            <select name="journeyEvent" className="input" required>
              <option value="NORMAL">Normal Cancellation</option>
              <option value="TRAIN_CANCELLED">Train Cancelled</option>
              <option value="TRAIN_LATE_MORE_THAN_3_HOURS">
                Train Late More Than 3 Hours
              </option>
              <option value="TRAIN_PARTIALLY_CANCELLED">
                Train Partially Cancelled
              </option>
              <option value="TRAIN_DIVERTED">Train Diverted</option>
              <option value="TRAIN_SHORT_TERMINATED">
                Train Short Terminated
              </option>
            </select>
          </Field>

          <Field label="Passenger Not Travelled?">
            <select name="passengerNotTravelled" className="input">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>

          <Field label="TDR Filed Before Actual Departure?">
            <select name="tdrFiledBeforeActualDeparture" className="input">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Calculate Refund"}
        </button>
      </form>

      <RefundBreakdown result={result} />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}