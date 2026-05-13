/**
 * PassengersService manages all interactions with the backend API related to passengers on flights.
 * It provides methods to retrieve passengers for a specific flight, add new passengers, update existing passenger information, and delete passengers from a flight.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Passenger, PassengerFormData } from '../models/passenger.model';

@Injectable({
  providedIn: 'root'
})
export class PassengersService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET /flights/:id/passengers — JWT required
   * Retrieves all passengers booked on a specific flight
   * Requires valid JWT token (any authenticated user)
   * Returns array of passenger objects with personal details
   */

  getPassengers(flightId: string): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(`${this.apiUrl}/flights/${flightId}/passengers`);
  }

  /**
   * POST /flights/:id/passengers — JWT required
   * Adds a new passenger to an existing flight
   * Requires valid JWT token (any authenticated user)
   * Accepts passenger form data including name, passport number, and seat preference
   * Returns confirmation response after successful addition
   */
  
  addPassenger(flightId: string, passenger: PassengerFormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/flights/${flightId}/passengers`, passenger);
  }

  /**
   * PUT /flights/:id/passengers/:passport — JWT required
   * Updates an existing passenger's information on a specific flight
   * Requires valid JWT token (any authenticated user)
   * Accepts partial passenger form data and updates the corresponding fields
   * Returns confirmation response after successful update
   */
  updatePassenger(flightId: string, passportNumber: string, data: Partial<PassengerFormData>): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/flights/${flightId}/passengers/${passportNumber}`,
      data
    );
  }

  /**
   * DELETE /flights/:id/passengers/:passport — Admin only
   * Removes a passenger from a specific flight
   * Requires valid JWT token with admin privileges
   * Returns confirmation response after successful deletion
   */
  deletePassenger(flightId: string, passportNumber: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/flights/${flightId}/passengers/${passportNumber}`
    );
  }
}