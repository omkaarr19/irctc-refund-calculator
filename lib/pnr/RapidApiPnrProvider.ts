import type { PnrProvider } from "./PnrProvider";
import type { PnrBooking, PnrLookupResult } from "./pnrTypes";

type RapidApiProviderOptions = {
  apiKey: string;
  apiHost: string;
  endpoint: string;
};

export class RapidApiPnrProvider implements PnrProvider {
  name = "rapidapi-provider";

  constructor(private readonly options: RapidApiProviderOptions) {}

  async lookup(pnr: string): Promise<PnrLookupResult> {
    if (!/^\d{10}$/.test(pnr)) {
      throw new Error("PNR must be exactly 10 digits.");
    }

    if (!this.options.apiKey || !this.options.apiHost || !this.options.endpoint) {
      throw new Error("RapidAPI provider is not configured.");
    }

    const url = this.buildUrl(pnr);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.options.apiKey,
        "x-rapidapi-host": this.options.apiHost,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed with status ${response.status}.`);
    }

    const rawData = await response.json();

    return {
      provider: this.name,
      booking: this.mapResponseToBooking(pnr, rawData),
    };
  }

  private buildUrl(pnr: string): string {
    if (this.options.endpoint.includes("{pnr}")) {
      return this.options.endpoint.replace("{pnr}", encodeURIComponent(pnr));
    }

    const url = new URL(this.options.endpoint);
    url.searchParams.set("pnr", pnr);

    return url.toString();
  }

  private mapResponseToBooking(pnr: string, rawData: unknown): PnrBooking {
    const data = normalizeRawData(rawData);

    return {
      pnr,

      trainNumber:
        getString(data, ["trainNumber", "train_number", "trainNo", "train_no"]) ||
        "UNKNOWN",

      trainName:
        getString(data, ["trainName", "train_name", "name"]) ||
        "Unknown Train",

      journeyDate:
        getString(data, ["journeyDate", "journey_date", "dateOfJourney", "doj"]) ||
        "",

      boardingStation:
        getString(data, ["boardingStation", "boarding_station", "from", "source"]) ||
        "",

      destinationStation:
        getString(data, [
          "destinationStation",
          "destination_station",
          "to",
          "destination",
        ]) || "",

      bookingClass:
        getString(data, ["bookingClass", "class", "journeyClass"]) || "3A",

      ticketStatus:
        normalizeTicketStatus(
          getString(data, ["ticketStatus", "currentStatus", "current_status", "status"])
        ),

      quota:
        normalizeQuota(getString(data, ["quota", "bookingQuota", "booking_quota"])),

      farePaid: Number(getValue(data, ["farePaid", "fare", "totalFare", "amount"])) || 0,

      passengerCount:
        Number(getValue(data, ["passengerCount", "passengersCount"])) ||
        getPassengerCount(data) ||
        1,

      scheduledDeparture:
        getString(data, [
          "scheduledDeparture",
          "scheduled_departure",
          "departureTime",
          "departure_time",
        ]) || new Date().toISOString(),

      cancellationTime: new Date().toISOString(),

      chartPrepared: Boolean(
        getValue(data, ["chartPrepared", "chart_prepared", "chartStatus"])
      ),

      journeyEvent: "NORMAL",

      passengerNotTravelled: false,
      tdrFiledBeforeActualDeparture: false,
    };
  }
}

function normalizeRawData(rawData: unknown): Record<string, unknown> {
  if (!rawData || typeof rawData !== "object") return {};

  const objectData = rawData as Record<string, unknown>;

  if (objectData.data && typeof objectData.data === "object") {
    return objectData.data as Record<string, unknown>;
  }

  if (objectData.result && typeof objectData.result === "object") {
    return objectData.result as Record<string, unknown>;
  }

  return objectData;
}

function getValue(
  data: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) {
      return data[key];
    }
  }

  return undefined;
}

function getString(
  data: Record<string, unknown>,
  keys: string[]
): string {
  const value = getValue(data, keys);

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  return "";
}

function getPassengerCount(data: Record<string, unknown>): number {
  const passengers = getValue(data, ["passengers", "passenger"]);

  if (Array.isArray(passengers)) {
    return passengers.length;
  }

  return 0;
}

function normalizeTicketStatus(status: string): PnrBooking["ticketStatus"] {
  const upper = status.toUpperCase();

  if (upper.includes("CNF") || upper.includes("CONFIRM")) return "CONFIRMED";
  if (upper.includes("RAC")) return "RAC";
  if (upper.includes("WL") || upper.includes("WAIT")) return "WAITLISTED";

  return "CONFIRMED";
}

function normalizeQuota(quota: string): PnrBooking["quota"] {
  const upper = quota.toUpperCase();

  if (upper.includes("TATKAL") && upper.includes("PREMIUM")) {
    return "PREMIUM_TATKAL";
  }

  if (upper.includes("TATKAL")) {
    return "TATKAL";
  }

  return "GENERAL";
}