export type BookingClass =
  | "1A"
  | "EC"
  | "2A"
  | "FC"
  | "3A"
  | "CC"
  | "3E"
  | "SL"
  | "2S";

export type TicketStatus =
  | "CONFIRMED"
  | "RAC"
  | "WAITLISTED"
  | "PARTIALLY_CONFIRMED";

export type Quota =
  | "GENERAL"
  | "TATKAL"
  | "PREMIUM_TATKAL";

export type JourneyEvent =
  | "NORMAL"
  | "TRAIN_CANCELLED"
  | "TRAIN_LATE_MORE_THAN_3_HOURS"
  | "TRAIN_PARTIALLY_CANCELLED"
  | "TRAIN_DIVERTED"
  | "TRAIN_SHORT_TERMINATED";

export interface RefundInput {
  bookingClass: BookingClass;
  ticketStatus: TicketStatus;
  quota: Quota;

  farePaid: number;
  passengerCount: number;

  scheduledDeparture: string;
  cancellationTime: string;

  chartPrepared: boolean;

  journeyEvent: JourneyEvent;

  passengerNotTravelled?: boolean;
  tdrFiledBeforeActualDeparture?: boolean;
}

export interface RefundDeduction {
  label: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  status:
    | "SUCCESS"
    | "FULL_REFUND"
    | "NO_REFUND"
    | "TDR_REQUIRED"
    | "RULE_NOT_SUPPORTED";

  originalFare: number;
  cancellationCharge: number;
  clerkageCharge: number;
  gstAmount: number;
  totalDeduction: number;
  refundAmount: number;

  ruleApplied: string;
  explanation: string;
  deductions: RefundDeduction[];
}