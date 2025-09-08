import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskResponse, Task } from '../model/todo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/api/todo';

  createTask(task: Task): Observable<TaskResponse> {
    const payload = {
      ...task,
      dueDate: task.dueDate, // keep yyyy-MM-dd as string
    };

    return this.http.post<TaskResponse>(`${this.apiUrl}`, payload);
  }

  // getTaskById(id: number): Observable<TaskResponse> {
  //   return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`, {
  //     headers: this.getAuthHeaders(),
  //   });
  // }

  deleteTask(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateTask(id: number, obj: Task): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/${id}`, obj);
  }

  getAllTasks(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?page=${page}&size=${size}&sort=dueDate,asc`
    );
  }
}
