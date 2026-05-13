import { BookingClass } from "./refundTypes";

export const IRCTC_2026_RULES = {
  version: "IRCTC_GENERAL_2026",

  gst: {
    rate: 0.05,
    applicableClasses: ["1A", "EC", "2A", "FC", "3A", "CC", "3E"] as BookingClass[],
  },

  confirmed: {
    flatCharges: {
      "1A": 240,
      EC: 240,
      "2A": 200,
      FC: 200,
      "3A": 180,
      CC: 180,
      "3E": 180,
      SL: 120,
      "2S": 60,
    } satisfies Record<BookingClass, number>,

    moreThan48Hours: {
      type: "FLAT",
    },

    between48And12Hours: {
      percentage: 25,
    },

    between12And4Hours: {
      percentage: 50,
    },

    noRefundLessThanHours: 4,
  },

  racWaitlist: {
    clerkagePerPassenger: 60,
    allowedUntilMinutesBeforeDeparture: 30,
  },

  tatkal: {
    confirmedRefundAllowed: false,
    racWaitlistUsesNormalRule: true,
  },

  premiumTatkal: {
    refundAllowed: false,
  },

  trainDelay: {
    fullRefundDelayHours: 3,
  },
} as const;