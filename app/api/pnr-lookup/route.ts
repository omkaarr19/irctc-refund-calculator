import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pnr = String(body.pnr || "").trim();

    if (!/^\d{10}$/.test(pnr)) {
      return NextResponse.json(
        {
          success: false,
          error: "PNR must be exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    // Mock PNR data for development.
    // Later we will replace this with real railway API provider integration.
    const mockBooking = {
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
      cancellationTime: new Date().toISOString(),

      chartPrepared: false,
      journeyEvent: "NORMAL",

      passengerNotTravelled: false,
      tdrFiledBeforeActualDeparture: false,
    };

    return NextResponse.json({
      success: true,
      booking: mockBooking,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch PNR details.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "PNR lookup API is running. Use POST with a 10-digit PNR.",
  });
}