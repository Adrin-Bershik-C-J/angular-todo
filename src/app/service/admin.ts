import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterModel, RegisterResponse } from '../model/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/api/admin';

  createManagerOrTL(
    role: string,
    obj: RegisterModel
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-user?role=${role}`, obj, { responseType: 'text' });
  }

  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`);
  }

  getAllSubTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subtasks`);
  }

  deleteUser(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${username}`);
  }
}
