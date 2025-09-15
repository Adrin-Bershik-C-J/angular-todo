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

  getSubTasksByTL(): Observable<SubtaskResponse[]> {
    return this.http.get<SubtaskResponse[]>(`${this.apiUrl}/tl`);
  }

  getSubTasksCreatedByTL(): Observable<SubtaskResponse[]> {
    return this.http.get<SubtaskResponse[]>(`${this.apiUrl}/tl/created`);
  }

  getSubTasksByMember(): Observable<SubtaskResponse[]> {
    return this.http.get<SubtaskResponse[]>(`${this.apiUrl}/member`);
  }

  getSubTasksByManager(): Observable<SubtaskResponse[]> {
    return this.http.get<SubtaskResponse[]>(`${this.apiUrl}/manager`);
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
