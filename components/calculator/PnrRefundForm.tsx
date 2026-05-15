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

  function updateBooking<K extends keyof PnrBooking>(
    key: K,
    value: PnrBooking[K]
  ) {
    setBooking((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        [key]: value,
      };
    });
  }

  async function calculateFromPnr() {
    if (!booking) return;

    setError("");
    setResult(null);
    setCalculateLoading(true);

    try {
      const payload = {
        bookingClass: booking.bookingClass,
        ticketStatus: booking.ticketStatus,
        quota: booking.quota,
        farePaid: Number(booking.farePaid),
        passengerCount: Number(booking.passengerCount),
        scheduledDeparture: new Date(booking.scheduledDeparture).toISOString(),
        cancellationTime: new Date(booking.cancellationTime).toISOString(),
        chartPrepared: booking.chartPrepared,
        journeyEvent: booking.journeyEvent,
        passengerNotTravelled: booking.passengerNotTravelled,
        tdrFiledBeforeActualDeparture: booking.tdrFiledBeforeActualDeparture,
      };

      const response = await fetch("/api/calculate-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
            Enter a 10-digit PNR number. The system will fetch available booking
            details, then you can verify or edit missing fields before
            calculating the refund.
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
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
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

            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Verify details before calculation
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Some PNR APIs may not return fare, quota, chart status, or TDR
                details. Please correct the fields below before calculating.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DisplayInfo label="Journey Date" value={booking.journeyDate} />

              <DisplayInfo
                label="Route"
                value={`${booking.boardingStation} → ${booking.destinationStation}`}
              />

              <Field label="Booking Class">
                <select
                  className="input"
                  value={booking.bookingClass}
                  onChange={(event) =>
                    updateBooking("bookingClass", event.target.value)
                  }
                >
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
                <select
                  className="input"
                  value={booking.ticketStatus}
                  onChange={(event) =>
                    updateBooking("ticketStatus", event.target.value)
                  }
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="RAC">RAC</option>
                  <option value="WAITLISTED">Waitlisted</option>
                  <option value="PARTIALLY_CONFIRMED">
                    Partially Confirmed
                  </option>
                </select>
              </Field>

              <Field label="Quota">
                <select
                  className="input"
                  value={booking.quota}
                  onChange={(event) => updateBooking("quota", event.target.value)}
                >
                  <option value="GENERAL">General</option>
                  <option value="TATKAL">Tatkal</option>
                  <option value="PREMIUM_TATKAL">Premium Tatkal</option>
                </select>
              </Field>

              <Field label="Fare Paid">
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="0.01"
                  value={booking.farePaid}
                  onChange={(event) =>
                    updateBooking("farePaid", Number(event.target.value))
                  }
                />
              </Field>

              <Field label="Passenger Count">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="6"
                  value={booking.passengerCount}
                  onChange={(event) =>
                    updateBooking("passengerCount", Number(event.target.value))
                  }
                />
              </Field>

              <Field label="Chart Prepared?">
                <select
                  className="input"
                  value={booking.chartPrepared ? "yes" : "no"}
                  onChange={(event) =>
                    updateBooking("chartPrepared", event.target.value === "yes")
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>

              <Field label="Scheduled Departure">
                <input
                  className="input"
                  type="datetime-local"
                  value={toDateTimeLocalValue(booking.scheduledDeparture)}
                  onChange={(event) =>
                    updateBooking("scheduledDeparture", event.target.value)
                  }
                />
              </Field>

              <Field label="Cancellation Time">
                <input
                  className="input"
                  type="datetime-local"
                  value={toDateTimeLocalValue(booking.cancellationTime)}
                  onChange={(event) =>
                    updateBooking("cancellationTime", event.target.value)
                  }
                />
              </Field>

              <Field label="Journey Event">
                <select
                  className="input"
                  value={booking.journeyEvent}
                  onChange={(event) =>
                    updateBooking("journeyEvent", event.target.value)
                  }
                >
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
                <select
                  className="input"
                  value={booking.passengerNotTravelled ? "yes" : "no"}
                  onChange={(event) =>
                    updateBooking(
                      "passengerNotTravelled",
                      event.target.value === "yes"
                    )
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>

              <Field label="TDR Filed Before Actual Departure?">
                <select
                  className="input"
                  value={booking.tdrFiledBeforeActualDeparture ? "yes" : "no"}
                  onChange={(event) =>
                    updateBooking(
                      "tdrFiledBeforeActualDeparture",
                      event.target.value === "yes"
                    )
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
            </div>

            <button
              type="button"
              onClick={calculateFromPnr}
              disabled={calculateLoading}
              className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {calculateLoading
                ? "Calculating Refund..."
                : "Calculate Refund from Confirmed Details"}
            </button>
          </div>
        )}
      </section>

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

function DisplayInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function toDateTimeLocalValue(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);

  return localDate.toISOString().slice(0, 16);
}