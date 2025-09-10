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

  getProjectByLoggedInManager(): Observable<ProjectResponseModel> {
    return this.http.get<ProjectResponseModel>(`${this.apiUrl}`);
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
}
