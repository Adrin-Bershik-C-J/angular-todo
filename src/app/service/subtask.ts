import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SubTask, SubtaskResponse } from '../model/subtask.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubTaskService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/api/subtasks';

  createSubTask(obj: SubTask): Observable<SubtaskResponse> {
    return this.http.post<SubtaskResponse>(`${this.apiUrl}`, obj);
  }

  getSubTasksByTL(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tl?page=${page}&size=${size}`);
  }

  getSubTasksCreatedByTL(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tl/created?page=${page}&size=${size}`);
  }

  getSubTasksByMember(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/member?page=${page}&size=${size}`);
  }

  getSubTasksByManager(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/manager?page=${page}&size=${size}`);
  }

  updateStatus(taskId: number, status: string): Observable<SubtaskResponse> {
    return this.http.patch<SubtaskResponse>(
      `${this.apiUrl}/${taskId}/status?status=${status}`,
      null
    );
  }

  updateSubTask(taskId: number, obj: SubTask): Observable<SubtaskResponse> {
    return this.http.put<SubtaskResponse>(`${this.apiUrl}/${taskId}`, obj);
  }

  deleteSubTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }
}
