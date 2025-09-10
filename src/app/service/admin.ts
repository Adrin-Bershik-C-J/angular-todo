import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterModel, RegisterResponse } from '../model/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/api/admin/create-user';

  createManagerOrTL(
    role: string,
    obj: RegisterModel
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}?role=${role}`, obj);
  }
}
