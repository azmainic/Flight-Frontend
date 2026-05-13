/**
 * This file defines the data models for passengers in the flight management system.
 * It includes interfaces for Passenger and PassengerFormData, as well as type definitions for SeatClass and BookingStatus.
 * These models are used throughout the application to ensure type safety and consistency when handling passenger data.
 */ 

export type SeatClass = 'economy' | 'business' | 'first';
export type BookingStatus = 'confirmed' | 'cancelled' | 'checked_in' | 'booked';

/**
 * Passenger interface defines the structure of a passenger object in the system.
 * It includes details such as full name, passport number, nationality, seat class, seat number, and booking status.
 * This model is used for type safety when working with passenger data across the application, ensuring consistent handling of passenger information.
 */

export interface Passenger {
  full_name: string;
  passport_number: string;
  nationality: string;
  seat_class: SeatClass;
  seat_number: string;
  booking_status: BookingStatus;
}

/**
 * PassengerFormData interface defines the structure of the data used when creating or updating a passenger through a form.
 * It has the same fields as the Passenger interface, but can be used to differentiate between form input data and actual passenger objects in the system.
 * This model helps in handling form data consistently across the application when managing passenger information.
 */

export interface PassengerFormData {
  full_name: string;
  passport_number: string;
  nationality: string;
  seat_class: SeatClass;
  seat_number: string;
  booking_status: BookingStatus;
}