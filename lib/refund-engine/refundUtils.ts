import { BookingClass } from "./refundTypes";
import { IRCTC_2026_RULES } from "./refundRules";

export function roundMoney(value: number): number {
  return Math.max(0, Math.round(value * 100) / 100);
}

export function getHoursBeforeDeparture(
  scheduledDeparture: string,
  cancellationTime: string
): number {
  const departureMs = new Date(scheduledDeparture).getTime();
  const cancellationMs = new Date(cancellationTime).getTime();

  return (departureMs - cancellationMs) / (1000 * 60 * 60);
}

export function getMinutesBeforeDeparture(
  scheduledDeparture: string,
  cancellationTime: string
): number {
  return getHoursBeforeDeparture(scheduledDeparture, cancellationTime) * 60;
}

export function calculateGst(amount: number, bookingClass: BookingClass): number {
  const isGstApplicable =
    IRCTC_2026_RULES.gst.applicableClasses.includes(bookingClass);

  if (!isGstApplicable) return 0;

  return roundMoney(amount * IRCTC_2026_RULES.gst.rate);
}