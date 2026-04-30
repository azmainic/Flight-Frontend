export interface FlightOriginDestination {
  code: string;
  city: string;
  country: string;
}

export interface Passenger {
  full_name: string;
  passport_number: string;
  nationality: string;
  seat_class: 'economy' | 'business' | 'first';
  seat_number: string;
  booking_status: 'confirmed' | 'cancelled' | 'checked_in' | 'booked';
}

export interface Flight {
  _id: string;
  flight_number: string;
  airline: string;
  origin: FlightOriginDestination;
  destination: FlightOriginDestination;
  departure_time: string;
  arrival_time: string;
  aircraft_type: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled';
  passengers?: Passenger[];
}

export interface FlightListResponse {
  flights: Flight[];
  total?: number;
  page?: number;
  page_size?: number;
}