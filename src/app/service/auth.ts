import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AuthResponse,
  LoginModel,
  RegisterModel,
  RegisterResponse,
} from '../model/auth.model';
import { Observable, tap, switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/api/auth';

  login(obj: LoginModel): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, obj).pipe(
      tap((response: AuthResponse) => {
        localStorage.setItem('token', response.token);
      }),
      switchMap((response: AuthResponse) => {
        return this.getCurrentUser().pipe(
          tap((user: any) => {
            localStorage.setItem('role', user.role);
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('name', user.name);
          }),
          map(() => response)
        );
      })
    );
  }

  register(obj: RegisterModel): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, obj);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  getUserName(): string | null {
    return localStorage.getItem('name');
  }

  getUsername(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
  }
}
