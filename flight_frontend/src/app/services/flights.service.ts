/**
 * FlightsService handles all interactions with the backend API related to flight data.
 * It provides methods to fetch flight lists, search flights with filters, and perform CRUD operations on flights.
 * The service also includes a method to retrieve analytics data for administrative purposes.
 * All methods return observables that components can subscribe to for asynchronous data handling.
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Flight, FlightListResponse } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

   /** 
    * GET /flights — public
    * Fetches a paginated list of all flights from the server
    * Accepts page number and page size as query parameters
    * Endpoint is publicly accessible without authentication
    * Returns observable containing flight list and pagination metadata
    */

  getFlights(page: number = 1, pageSize: number = 10): Observable<FlightListResponse> {
    const params = new HttpParams()
      .set('pn', page.toString())
      .set('ps', pageSize.toString());

    return this.http.get<FlightListResponse>(`${this.apiUrl}/flights`, { params });
  }

   /**
    * GET /flights/search — public
    * Searches flights based on optional filters
    * Supported filters: origin airport, destination airport, flight status
    * All parameters are optional and only included when provided
    * Endpoint is publicly accessible without authentication
    * Returns observable containing list of flights matching the search criteria
    */

  searchFlights(origin?: string, destination?: string, status?: string): Observable<FlightListResponse> {
    let params = new HttpParams();
    if (origin)      params = params.set('origin', origin);
    if (destination) params = params.set('destination', destination);
    if (status)      params = params.set('status', status);

    return this.http.get<FlightListResponse>(`${this.apiUrl}/flights/search`, { params });
  }

   /**
    * GET /flights/analytics — Admin only
    * Endpoint requires admin privileges, token is attached by HTTP interceptor
    * Retrieves flight analytics data for administrative dashboard
    * Returns observable containing analytics metrics such as total flights, on-time percentage, and delay statistics
    */

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/flights/analytics`);
  }

  /**
   * GET /flights/:id — public
   * Fetches detailed information for a single flight by its unique ID
   * Returns complete flight object including schedule and capacity details
   */

  getFlightById(id: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/flights/${id}`);
  }

  /**
   * POST /flights — Admin only
   * Creates a new flight in the system
   * Endpoint requires admin privileges
   * Accepts partial flight object and returns the created flight with server-generated fields
   */

  createFlight(flight: Partial<Flight>): Observable<Flight> {
    return this.http.post<Flight>(`${this.apiUrl}/flights`, flight);
  }

  /**
   * PUT /flights/:id — Admin only
   * Updates an existing flight identified by its ID
   * Endpoint requires admin privileges
   */
  updateFlight(id: string, flight: Partial<Flight>): Observable<Flight> {
    return this.http.put<Flight>(`${this.apiUrl}/flights/${id}`, flight);
  }

  /**
   * DELETE /flights/:id — Admin only
   * Deletes a flight identified by its ID
   * Endpoint requires admin privileges
   */
  deleteFlight(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/flights/${id}`);
  }
}