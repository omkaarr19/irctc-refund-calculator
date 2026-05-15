import { IRCTC_2026_RULES } from "./refundRules";
import { RefundInput, RefundResult } from "./refundTypes";
import {
  calculateGst,
  getHoursBeforeDeparture,
  getMinutesBeforeDeparture,
  roundMoney,
} from "./refundUtils";

export function calculateRefund(input: RefundInput): RefundResult {
  const fare = roundMoney(input.farePaid);
  const passengerCount = input.passengerCount;

  if (fare <= 0 || passengerCount <= 0) {
    return {
      status: "RULE_NOT_SUPPORTED",
      originalFare: fare,
      cancellationCharge: 0,
      clerkageCharge: 0,
      gstAmount: 0,
      totalDeduction: 0,
      refundAmount: 0,
      ruleApplied: "INVALID_INPUT",
      explanation: "Fare and passenger count must be greater than zero.",
      deductions: [],
    };
  }

  // 1. Train cancelled
  if (input.journeyEvent === "TRAIN_CANCELLED") {
    return fullRefund(input, "TRAIN_CANCELLED_FULL_REFUND");
  }

  // 2. Train late more than 3 hours
  if (input.journeyEvent === "TRAIN_LATE_MORE_THAN_3_HOURS") {
    if (input.passengerNotTravelled && input.tdrFiledBeforeActualDeparture) {
      return fullRefund(input, "TRAIN_LATE_MORE_THAN_3_HOURS_FULL_REFUND");
    }

    return noRefund(
      input,
      "TRAIN_LATE_TDR_CONDITION_NOT_MET",
      "For train delay refund, passenger must not travel and TDR must be filed before actual departure."
    );
  }

  // 3. Partial cancellation, diversion, short termination
  if (
    input.journeyEvent === "TRAIN_PARTIALLY_CANCELLED" ||
    input.journeyEvent === "TRAIN_DIVERTED" ||
    input.journeyEvent === "TRAIN_SHORT_TERMINATED"
  ) {
    return {
      status: "TDR_REQUIRED",
      originalFare: fare,
      cancellationCharge: 0,
      clerkageCharge: 0,
      gstAmount: 0,
      totalDeduction: 0,
      refundAmount: 0,
      ruleApplied: "TDR_REQUIRED_FOR_SPECIAL_TRAIN_EVENT",
      explanation:
        "This case requires TDR filing. Exact refund depends on railway approval.",
      deductions: [],
    };
  }

  // 4. Premium Tatkal
  if (input.quota === "PREMIUM_TATKAL") {
    return noRefund(
      input,
      "PREMIUM_TATKAL_NO_REFUND",
      "Premium Tatkal tickets are not refundable except special railway cases."
    );
  }

  // 5. Tatkal confirmed ticket
  if (input.quota === "TATKAL" && input.ticketStatus === "CONFIRMED") {
    return noRefund(
      input,
      "CONFIRMED_TATKAL_NO_REFUND",
      "No refund is admissible on confirmed Tatkal tickets."
    );
  }

  // 6. RAC / Waitlisted
  if (input.ticketStatus === "RAC" || input.ticketStatus === "WAITLISTED") {
    return calculateRacWaitlistRefund(input);
  }

  // 7. Partially confirmed
  if (input.ticketStatus === "PARTIALLY_CONFIRMED") {
    return calculatePartiallyConfirmedRefund(input);
  }

  // 8. Confirmed normal ticket
  if (input.ticketStatus === "CONFIRMED") {
    return calculateConfirmedRefund(input);
  }

  return {
    status: "RULE_NOT_SUPPORTED",
    originalFare: fare,
    cancellationCharge: 0,
    clerkageCharge: 0,
    gstAmount: 0,
    totalDeduction: 0,
    refundAmount: 0,
    ruleApplied: "NO_MATCHING_RULE",
    explanation: "No matching refund rule found.",
    deductions: [],
  };
}

function calculateConfirmedRefund(input: RefundInput): RefundResult {
  const fare = roundMoney(input.farePaid);
  const hoursBefore = getHoursBeforeDeparture(
    input.scheduledDeparture,
    input.cancellationTime
  );

  const flatChargePerPassenger =
    IRCTC_2026_RULES.confirmed.flatCharges[input.bookingClass];

  const minimumCharge = flatChargePerPassenger * input.passengerCount;

  let cancellationCharge = 0;
  let ruleApplied = "";
  let explanation = "";

  if (hoursBefore > 48) {
    cancellationCharge = minimumCharge;
    ruleApplied = "CONFIRMED_MORE_THAN_48_HOURS";
    explanation =
      "Confirmed ticket cancelled more than 48 hours before departure. Flat class-wise cancellation charge applied.";
  } else if (hoursBefore <= 48 && hoursBefore > 12) {
    cancellationCharge = Math.max(fare * 0.25, minimumCharge);
    ruleApplied = "CONFIRMED_48_TO_12_HOURS";
    explanation =
      "Confirmed ticket cancelled between 48 and 12 hours before departure. 25% of fare deducted, subject to minimum flat charge.";
  } else if (hoursBefore <= 12 && hoursBefore >= 4) {
    cancellationCharge = Math.max(fare * 0.5, minimumCharge);
    ruleApplied = "CONFIRMED_12_TO_4_HOURS";
    explanation =
      "Confirmed ticket cancelled between 12 and 4 hours before departure. 50% of fare deducted, subject to minimum flat charge.";
  } else {
    return noRefund(
      input,
      "CONFIRMED_LESS_THAN_4_HOURS_NO_REFUND",
      "No refund is admissible for confirmed tickets cancelled less than 4 hours before departure."
    );
  }

  cancellationCharge = roundMoney(cancellationCharge);
  const gstAmount = calculateGst(cancellationCharge, input.bookingClass);
  const totalDeduction = roundMoney(cancellationCharge + gstAmount);
  const refundAmount = roundMoney(fare - totalDeduction);

  return {
    status: "SUCCESS",
    originalFare: fare,
    cancellationCharge,
    clerkageCharge: 0,
    gstAmount,
    totalDeduction,
    refundAmount,
    ruleApplied,
    explanation,
    deductions: [
      {
        label: "Cancellation Charge",
        amount: cancellationCharge,
        reason: explanation,
      },
      {
        label: "GST",
        amount: gstAmount,
        reason: "GST applied where applicable as per class configuration.",
      },
    ],
  };
}

function calculateRacWaitlistRefund(input: RefundInput): RefundResult {
  const fare = roundMoney(input.farePaid);
  const minutesBefore = getMinutesBeforeDeparture(
    input.scheduledDeparture,
    input.cancellationTime
  );

  if (
    minutesBefore <
    IRCTC_2026_RULES.racWaitlist.allowedUntilMinutesBeforeDeparture
  ) {
    return noRefund(
      input,
      "RAC_WAITLIST_AFTER_30_MINUTES_NO_REFUND",
      "RAC/waitlisted tickets must be cancelled up to 30 minutes before departure."
    );
  }

  const clerkageCharge =
    IRCTC_2026_RULES.racWaitlist.clerkagePerPassenger *
    input.passengerCount;

  const gstAmount = calculateGst(clerkageCharge, input.bookingClass);
  const totalDeduction = roundMoney(clerkageCharge + gstAmount);

  return {
    status: "SUCCESS",
    originalFare: fare,
    cancellationCharge: 0,
    clerkageCharge,
    gstAmount,
    totalDeduction,
    refundAmount: roundMoney(fare - totalDeduction),
    ruleApplied: "RAC_WAITLIST_REFUND_WITH_CLERKAGE",
    explanation:
      "RAC/waitlisted ticket cancelled within permitted time. Clerkage charge deducted.",
    deductions: [
      {
        label: "Clerkage Charge",
        amount: clerkageCharge,
        reason: "RAC/waitlisted clerkage deducted per passenger.",
      },
      {
        label: "GST",
        amount: gstAmount,
        reason: "GST applied where applicable as per class configuration.",
      },
    ],
  };
}

function calculatePartiallyConfirmedRefund(input: RefundInput): RefundResult {
  const fare = roundMoney(input.farePaid);
  const minutesBefore = getMinutesBeforeDeparture(
    input.scheduledDeparture,
    input.cancellationTime
  );

  if (
    minutesBefore <
    IRCTC_2026_RULES.racWaitlist.allowedUntilMinutesBeforeDeparture
  ) {
    return {
      status: "TDR_REQUIRED",
      originalFare: fare,
      cancellationCharge: 0,
      clerkageCharge: 0,
      gstAmount: 0,
      totalDeduction: 0,
      refundAmount: 0,
      ruleApplied: "PARTIALLY_CONFIRMED_TDR_REQUIRED",
      explanation:
        "Partially confirmed tickets after allowed cancellation window may require TDR filing.",
      deductions: [],
    };
  }

  const clerkageCharge =
    IRCTC_2026_RULES.racWaitlist.clerkagePerPassenger *
    input.passengerCount;

  const gstAmount = calculateGst(clerkageCharge, input.bookingClass);
  const totalDeduction = roundMoney(clerkageCharge + gstAmount);

  return {
    status: "SUCCESS",
    originalFare: fare,
    cancellationCharge: 0,
    clerkageCharge,
    gstAmount,
    totalDeduction,
    refundAmount: roundMoney(fare - totalDeduction),
    ruleApplied: "PARTIALLY_CONFIRMED_REFUND_WITH_CLERKAGE",
    explanation:
      "Partially confirmed ticket cancelled within permitted time. Clerkage deducted.",
    deductions: [
      {
        label: "Clerkage Charge",
        amount: clerkageCharge,
        reason: "Clerkage deducted per passenger.",
      },
      {
        label: "GST",
        amount: gstAmount,
        reason: "GST applied where applicable as per class configuration.",
      },
    ],
  };
}

function fullRefund(input: RefundInput, ruleApplied: string): RefundResult {
  const fare = roundMoney(input.farePaid);

  return {
    status: "FULL_REFUND",
    originalFare: fare,
    cancellationCharge: 0,
    clerkageCharge: 0,
    gstAmount: 0,
    totalDeduction: 0,
    refundAmount: fare,
    ruleApplied,
    explanation: "Full refund is applicable for this case.",
    deductions: [],
  };
}

function noRefund(
  input: RefundInput,
  ruleApplied: string,
  explanation: string
): RefundResult {
  const fare = roundMoney(input.farePaid);

  return {
    status: "NO_REFUND",
    originalFare: fare,
    cancellationCharge: 0,
    clerkageCharge: 0,
    gstAmount: 0,
    totalDeduction: fare,
    refundAmount: 0,
    ruleApplied,
    explanation,
    deductions: [
      {
        label: "No Refund",
        amount: fare,
        reason: explanation,
      },
    ],
  };
}