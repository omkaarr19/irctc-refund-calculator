import { NextRequest, NextResponse } from "next/server";
import { calculateRefund } from "@/lib/refund-engine/calculateRefund";
import { refundInputSchema } from "@/lib/validations/refundSchema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedInput = refundInputSchema.parse(body);

    const result = calculateRefund(validatedInput);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid refund calculation request.",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Refund calculation API is running. Use POST to calculate refund.",
  });
}