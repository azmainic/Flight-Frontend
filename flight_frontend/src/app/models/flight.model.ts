/**
 * This file defines the data models for the flight management system.
 * It includes interfaces for Flight, Passenger, and related entities.
 * These models are used throughout the application to ensure type safety and consistency when handling flight data.
 */

export interface FlightOriginDestination {
  code: string;
  city: string;
  country: string;
}

/**
 * Passenger interface defines the structure of a passenger object in the system.
 * It includes details such as full name, passport number, nationality, seat class, seat number, and booking status.
 * This model is used for type safety when working with passenger data across the application, ensuring consistent handling of passenger information.
 */
export interface Passenger {
  full_name: string;
  passport_number: string;
  nationality: string;
  seat_class: 'economy' | 'business' | 'first';
  seat_number: string;
  booking_status: 'confirmed' | 'cancelled' | 'checked_in' | 'booked';
}

/**
 * Flight interface defines the structure of a flight object in the system.
 * It includes details such as flight number, airline, origin and destination information,  departure and arrival times, aircraft type, status, and an optional list of passengers.
 * This model is used for type safety when working with flight data across the application, ensuring consistent handling of flight information.
 */
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

/**
 * FlightListResponse defines the structure of the response when fetching a list of flights from the API.
 * It includes an array of Flight objects and optional pagination metadata such as total count, current page, and page size.
 * This model helps in handling API responses consistently across the application when displaying flight lists.
 */
export interface FlightListResponse {
  flights: Flight[];
  total?: number;
  page?: number;
  page_size?: number;
}