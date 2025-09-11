import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ProjectRequestModel,
  ProjectResponseModel,
} from '../model/project.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/api/projects';

  createProject(obj: ProjectRequestModel): Observable<ProjectResponseModel> {
    return this.http.post<ProjectResponseModel>(`${this.apiUrl}`, obj);
  }

  getProjectByLoggedInManager(): Observable<ProjectResponseModel[]> {
    return this.http.get<ProjectResponseModel[]>(`${this.apiUrl}`);
  }

  addMember(
    projectId: number,
    memberUsername: string
  ): Observable<ProjectResponseModel> {
    return this.http.post<ProjectResponseModel>(
      `${this.apiUrl}/add-member?projectId=${projectId}&memberUsername=${memberUsername}`,
      null
    );
  }

  updateProject(projectId: number, project: ProjectRequestModel): Observable<ProjectResponseModel> {
    return this.http.put<ProjectResponseModel>(`${this.apiUrl}/${projectId}`, project);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/users');
  }

  getProjectMembers(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/members`);
  }

  getProjectsByTL(): Observable<ProjectResponseModel[]> {
    return this.http.get<ProjectResponseModel[]>(`${this.apiUrl}/tl`);
  }
}
