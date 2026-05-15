import { NextRequest, NextResponse } from "next/server";
import { createPnrService } from "@/lib/pnr/PnrService";

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

    const pnrService = createPnrService();
    const result = await pnrService.lookup(pnr);

    return NextResponse.json({
      success: true,
      provider: result.provider,
      booking: result.booking,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch PNR details.",
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