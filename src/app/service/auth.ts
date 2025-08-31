import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  login(obj: any) {
    return this.http.post('http://localhost:8080/api/auth/login', obj);
  }

  register(obj: any) {
    return this.http.post('http://localhost:8080/api/auth/register', obj);
  }
}
