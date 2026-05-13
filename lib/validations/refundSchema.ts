import { z } from "zod";

export const refundInputSchema = z.object({
  bookingClass: z.enum(["1A", "EC", "2A", "FC", "3A", "CC", "3E", "SL", "2S"]),
  ticketStatus: z.enum([
    "CONFIRMED",
    "RAC",
    "WAITLISTED",
    "PARTIALLY_CONFIRMED",
  ]),
  quota: z.enum(["GENERAL", "TATKAL", "PREMIUM_TATKAL"]),

  farePaid: z.number().positive(),
  passengerCount: z.number().int().min(1).max(6),

  scheduledDeparture: z.string().datetime(),
  cancellationTime: z.string().datetime(),

  chartPrepared: z.boolean(),

  journeyEvent: z.enum([
    "NORMAL",
    "TRAIN_CANCELLED",
    "TRAIN_LATE_MORE_THAN_3_HOURS",
    "TRAIN_PARTIALLY_CANCELLED",
    "TRAIN_DIVERTED",
    "TRAIN_SHORT_TERMINATED",
  ]),

  passengerNotTravelled: z.boolean().optional(),
  tdrFiledBeforeActualDeparture: z.boolean().optional(),
});