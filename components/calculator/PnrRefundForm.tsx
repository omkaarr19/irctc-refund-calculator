"use client";

import { useState } from "react";
import RefundBreakdown, { RefundResult } from "./RefundBreakdown";

type PnrBooking = {
  pnr: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  boardingStation: string;
  destinationStation: string;

  bookingClass: string;
  ticketStatus: string;
  quota: string;

  farePaid: number;
  passengerCount: number;

  scheduledDeparture: string;
  cancellationTime: string;

  chartPrepared: boolean;
  journeyEvent: string;

  passengerNotTravelled: boolean;
  tdrFiledBeforeActualDeparture: boolean;
};

type PnrLookupResponse =
  | {
      success: true;
      booking: PnrBooking;
    }
  | {
      success: false;
      error: string;
    };

type RefundApiResponse =
  | {
      success: true;
      result: RefundResult;
    }
  | {
      success: false;
      error: string;
    };

export default function PnrRefundForm() {
  const [pnr, setPnr] = useState("");
  const [booking, setBooking] = useState<PnrBooking | null>(null);
  const [result, setResult] = useState<RefundResult | null>(null);
  const [error, setError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [calculateLoading, setCalculateLoading] = useState(false);

  async function handlePnrLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setBooking(null);
    setResult(null);

    if (!/^\d{10}$/.test(pnr)) {
      setError("Please enter a valid 10-digit PNR number.");
      return;
    }

    setLookupLoading(true);

    try {
      const response = await fetch("/api/pnr-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pnr }),
      });

      const data = (await response.json()) as PnrLookupResponse;

      if (!response.ok || !data.success) {
        setError(!data.success ? data.error : "Unable to fetch PNR details.");
        return;
      }

      setBooking(data.booking);
    } catch {
      setError("Server error while fetching PNR details.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function calculateFromPnr() {
    if (!booking) return;

    setError("");
    setResult(null);
    setCalculateLoading(true);

    try {
      const response = await fetch("/api/calculate-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingClass: booking.bookingClass,
          ticketStatus: booking.ticketStatus,
          quota: booking.quota,
          farePaid: booking.farePaid,
          passengerCount: booking.passengerCount,
          scheduledDeparture: booking.scheduledDeparture,
          cancellationTime: booking.cancellationTime,
          chartPrepared: booking.chartPrepared,
          journeyEvent: booking.journeyEvent,
          passengerNotTravelled: booking.passengerNotTravelled,
          tdrFiledBeforeActualDeparture: booking.tdrFiledBeforeActualDeparture,
        }),
      });

      const data = (await response.json()) as RefundApiResponse;

      if (!response.ok || !data.success) {
        setError(
          !data.success
            ? data.error
            : "Unable to calculate refund from PNR details."
        );
        return;
      }

      setResult(data.result);
    } catch {
      setError("Server error while calculating refund.");
    } finally {
      setCalculateLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            PNR Based Refund Calculation
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter a 10-digit PNR number. In this development version, the system
            uses mock railway data. Later we will connect a real PNR API.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handlePnrLookup} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              PNR Number
            </span>

            <input
              value={pnr}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(0, 10);
                setPnr(value);
              }}
              type="text"
              inputMode="numeric"
              maxLength={10}
              className="input"
              placeholder="Enter 10-digit PNR"
              required
            />
          </label>

          <button
            type="submit"
            disabled={lookupLoading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {lookupLoading ? "Fetching PNR..." : "Fetch PNR Details"}
          </button>
        </form>

        {booking && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {booking.trainName}
                </h3>
                <p className="text-sm text-slate-500">
                  Train No: {booking.trainNumber}
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                PNR {booking.pnr}
              </span>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <Info label="Journey Date" value={booking.journeyDate} />
              <Info
                label="Route"
                value={`${booking.boardingStation} → ${booking.destinationStation}`}
              />
              <Info label="Class" value={booking.bookingClass} />
              <Info label="Status" value={booking.ticketStatus} />
              <Info label="Quota" value={booking.quota} />
              <Info label="Fare Paid" value={`₹${booking.farePaid}`} />
              <Info
                label="Passenger Count"
                value={String(booking.passengerCount)}
              />
              <Info
                label="Chart Prepared"
                value={booking.chartPrepared ? "Yes" : "No"}
              />
            </div>

            <button
              type="button"
              onClick={calculateFromPnr}
              disabled={calculateLoading}
              className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {calculateLoading
                ? "Calculating Refund..."
                : "Calculate Refund from PNR"}
            </button>
          </div>
        )}
      </section>

      <RefundBreakdown result={result} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}