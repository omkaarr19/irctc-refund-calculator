import type { PnrProvider } from "./PnrProvider";
import type { PnrLookupResult } from "./pnrTypes";

export class MockPnrProvider implements PnrProvider {
  name = "mock-provider";

  async lookup(pnr: string): Promise<PnrLookupResult> {
    const now = new Date();

    return {
      provider: this.name,
      booking: {
        pnr,
        trainNumber: "12951",
        trainName: "Mumbai Rajdhani Express",
        journeyDate: "2026-06-10",
        boardingStation: "NDLS",
        destinationStation: "MMCT",

        bookingClass: "3A",
        ticketStatus: "CONFIRMED",
        quota: "GENERAL",

        farePaid: 2000,
        passengerCount: 1,

        scheduledDeparture: "2026-06-10T10:00:00.000Z",
        cancellationTime: now.toISOString(),

        chartPrepared: false,
        journeyEvent: "NORMAL",

        passengerNotTravelled: false,
        tdrFiledBeforeActualDeparture: false,
      },
    };
  }
}