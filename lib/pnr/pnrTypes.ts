export type PnrBooking = {
  pnr: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  boardingStation: string;
  destinationStation: string;

  bookingClass: string;
  ticketStatus: string;
  quota: string;

  farePaid: number;
  passengerCount: number;

  scheduledDeparture: string;
  cancellationTime: string;

  chartPrepared: boolean;
  journeyEvent: string;

  passengerNotTravelled: boolean;
  tdrFiledBeforeActualDeparture: boolean;
};

export type PnrLookupResult = {
  booking: PnrBooking;
  provider: string;
};