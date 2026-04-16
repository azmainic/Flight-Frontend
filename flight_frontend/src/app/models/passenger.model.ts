export type SeatClass = 'economy' | 'business' | 'first';
export type BookingStatus = 'confirmed' | 'cancelled' | 'checked_in' | 'booked';

export interface Passenger {
  full_name: string;
  passport_number: string;
  nationality: string;
  seat_class: SeatClass;
  seat_number: string;
  booking_status: BookingStatus;
}

export interface PassengerFormData {
  full_name: string;
  passport_number: string;
  nationality: string;
  seat_class: SeatClass;
  seat_number: string;
  booking_status: BookingStatus;
}