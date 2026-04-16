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
   * GET /flights — public, supports pagination
   */
  getFlights(page: number = 1, pageSize: number = 10): Observable<FlightListResponse> {
    const params = new HttpParams()
      .set('pn', page.toString())
      .set('ps', pageSize.toString());

    return this.http.get<FlightListResponse>(`${this.apiUrl}/flights`, { params });
  }

  /**
   * GET /flights/search — public
   */
  searchFlights(origin?: string, destination?: string, status?: string): Observable<FlightListResponse> {
    let params = new HttpParams();
    if (origin)      params = params.set('origin', origin);
    if (destination) params = params.set('destination', destination);
    if (status)      params = params.set('status', status);

    return this.http.get<FlightListResponse>(`${this.apiUrl}/flights/search`, { params });
  }

  /**
   * GET /flights/analytics — Admin only (token attached by interceptor)
   */
  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/flights/analytics`);
  }

  /**
   * GET /flights/:id — public
   */
  getFlightById(id: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/flights/${id}`);
  }

  /**
   * POST /flights — Admin only
   */
  createFlight(flight: Partial<Flight>): Observable<Flight> {
    return this.http.post<Flight>(`${this.apiUrl}/flights`, flight);
  }

  /**
   * PUT /flights/:id — Admin only
   */
  updateFlight(id: string, flight: Partial<Flight>): Observable<Flight> {
    return this.http.put<Flight>(`${this.apiUrl}/flights/${id}`, flight);
  }

  /**
   * DELETE /flights/:id — Admin only
   */
  deleteFlight(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/flights/${id}`);
  }
}