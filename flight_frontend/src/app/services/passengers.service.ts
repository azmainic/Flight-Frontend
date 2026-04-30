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
   */
  getPassengers(flightId: string): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(`${this.apiUrl}/flights/${flightId}/passengers`);
  }

  /**
   * POST /flights/:id/passengers — JWT required
   */
  addPassenger(flightId: string, passenger: PassengerFormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/flights/${flightId}/passengers`, passenger);
  }

  /**
   * PUT /flights/:id/passengers/:passport — JWT required
   */
  updatePassenger(flightId: string, passportNumber: string, data: Partial<PassengerFormData>): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/flights/${flightId}/passengers/${passportNumber}`,
      data
    );
  }

  /**
   * DELETE /flights/:id/passengers/:passport — Admin only
   */
  deletePassenger(flightId: string, passportNumber: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/flights/${flightId}/passengers/${passportNumber}`
    );
  }
}