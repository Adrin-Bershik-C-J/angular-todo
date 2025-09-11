import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { ProjectService } from '../../service/project';
import { SubTaskService } from '../../service/subtask';
import { TodoService } from '../../service/todo';
import { ProjectRequestModel, ProjectResponseModel } from '../../model/project.model';
import { SubTask } from '../../model/subtask.model';
import { Task } from '../../model/todo.model';

@Component({
  selector: 'app-manager-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <span class="navbar-brand">Manager Dashboard</span>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text me-3">Welcome, {{currentUser}}!</span>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <!-- Tab Navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">
            Overview
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'projects'" (click)="setActiveTab('projects')">
            Create Project
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'subtasks'" (click)="setActiveTab('subtasks')">
            Sub-Tasks
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'personal'" (click)="setActiveTab('personal')">
            Personal Tasks
          </button>
        </li>
      </ul>

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5>My Projects</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let project of projects" class="mb-3 p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6>{{project.name}}</h6>
                      <p class="text-muted mb-1">{{project.description}}</p>
                      <small class="text-muted">Due: {{project.dueDate | date}} | TL: {{project.tlUsername}}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" (click)="editProject(project)">Edit</button>
                  </div>
                </div>
                <div *ngIf="projects.length === 0" class="text-muted">No projects yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Tab -->
      <div *ngIf="activeTab === 'projects'" class="tab-content">
        <div class="row">
          <div class="col-md-5">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Create New Project</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createProject()">
                  <div class="mb-3">
                    <label class="form-label">Project Name</label>
                    <input type="text" class="form-control" [(ngModel)]="projectObj.name" name="name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="projectObj.description" name="description"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Due Date</label>
                    <input type="date" class="form-control" [(ngModel)]="projectObj.dueDate" name="dueDate" [min]="getTodayDate()" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Team Lead</label>
                    <select class="form-select" [(ngModel)]="selectedTlUsername" name="tlUsername" required>
                      <option value="">Select Team Lead</option>
                      <option *ngFor="let tl of getTLUsers()" [value]="tl.username">{{tl.name}} ({{tl.username}})</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Team Members</label>
                    <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                      <div *ngFor="let member of getMemberUsers()" class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               (change)="onMemberSelect(member.username, $event)"
                               [checked]="selectedMemberUsernames.includes(member.username)"
                               [id]="'member-' + member.id">
                        <label class="form-check-label" [for]="'member-' + member.id">
                          {{member.name}} ({{member.username}})
                        </label>
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-success w-100">Create Project</button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-7">
            <div class="card shadow-sm">
              <div class="card-header bg-info text-white">
                <h5 class="mb-0">Project Creation Guide</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <h6>Creating Projects</h6>
                  <ul class="mb-0">
                    <li>Select a Team Lead from available TLs</li>
                    <li>Choose multiple team members for the project</li>
                    <li>Set realistic due dates for project completion</li>
                    <li>Projects can be edited later (except Team Lead assignment)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'subtasks'" class="tab-content">
        <div class="row">
          <div class="col-md-5">
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">Create Sub-Task</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createSubTask()">
                  <div class="mb-3">
                    <label class="form-label">Sub-Task Name</label>
                    <input type="text" class="form-control" [(ngModel)]="subTaskObj.name" name="name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="subTaskObj.description" name="description"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Due Date</label>
                    <input type="date" class="form-control" [(ngModel)]="subTaskObj.dueDate" name="dueDate" [min]="getTodayDate()" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Project</label>
                    <select class="form-select" [(ngModel)]="subTaskObj.projectId" name="projectId" 
                            (change)="onProjectSelect()" required>
                      <option value="">Select Project</option>
                      <option *ngFor="let project of projects" [value]="project.id">{{project.name}}</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Assign To</label>
                    <select class="form-select" [(ngModel)]="subTaskObj.assigneeUsername" name="assigneeUsername" required>
                      <option value="">Select Assignee</option>
                      <option *ngFor="let member of projectMembers" [value]="member.username">
                        {{member.name}} ({{member.username}}) - {{member.role}}
                      </option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-warning w-100">Create Sub-Task</button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-7">
            <div class="card shadow-sm">
              <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Project Sub-Tasks</h5>
                <button class="btn btn-light btn-sm" (click)="loadManagerSubTasks()">
                  Refresh
                </button>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Project</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let subtask of managerSubTasks">
                        <td>{{subtask.name}}</td>
                        <td>{{subtask.memberUsername}}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-secondary': subtask.status === 'NOT_STARTED',
                            'bg-primary': subtask.status === 'IN_PROGRESS',
                            'bg-success': subtask.status === 'DONE'
                          }">{{subtask.status}}</span>
                        </td>
                        <td>{{subtask.dueDate | date}}</td>
                        <td>Project {{subtask.projectId}}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" 
                                    (click)="updateSubTaskStatus(subtask.id, 'NOT_STARTED')"
                                    [disabled]="subtask.status === 'NOT_STARTED'">
                              Not Started
                            </button>
                            <button class="btn btn-outline-primary" 
                                    (click)="updateSubTaskStatus(subtask.id, 'IN_PROGRESS')"
                                    [disabled]="subtask.status === 'IN_PROGRESS'">
                              In Progress
                            </button>
                            <button class="btn btn-outline-success" 
                                    (click)="updateSubTaskStatus(subtask.id, 'DONE')"
                                    [disabled]="subtask.status === 'DONE'">
                              Done
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr *ngIf="managerSubTasks.length === 0">
                        <td colspan="6" class="text-center text-muted">No sub-tasks found</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Tasks Tab -->
      <div *ngIf="activeTab === 'personal'" class="tab-content">
        <div class="row">
          <div class="col-md-5">
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">Create Personal Task</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createPersonalTask()">
                  <div class="mb-3">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-control" [(ngModel)]="personalTaskObj.title" name="title" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="personalTaskObj.description" name="description"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Priority</label>
                    <select class="form-select" [(ngModel)]="personalTaskObj.priority" name="priority" required>
                      <option value="">Select Priority</option>
                      <option>LOW</option>
                      <option>MEDIUM</option>
                      <option>HIGH</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Due Date</label>
                    <input type="date" class="form-control" [(ngModel)]="personalTaskObj.dueDate" name="dueDate" [min]="getTodayDate()" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" [(ngModel)]="personalTaskObj.status" name="status" required>
                      <option>NOT_STARTED</option>
                      <option>IN_PROGRESS</option>
                      <option>DONE</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-warning w-100">Add Personal Task</button>
                </form>
              </div>
            </div>
          </div>
          
          <div class="col-md-7">
            <div class="card shadow-sm">
              <div class="card-header bg-dark text-white">
                <h5 class="mb-0">My Personal Tasks</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let task of personalTasks">
                        <td>{{task.title}}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': task.priority === 'LOW',
                            'bg-warning': task.priority === 'MEDIUM',
                            'bg-danger': task.priority === 'HIGH'
                          }">{{task.priority}}</span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-secondary': task.status === 'NOT_STARTED',
                            'bg-primary': task.status === 'IN_PROGRESS',
                            'bg-success': task.status === 'DONE'
                          }">{{task.status}}</span>
                        </td>
                        <td>{{task.dueDate | date}}</td>
                        <td>
                          <button class="btn btn-sm btn-primary me-1" (click)="editPersonalTask(task)">Edit</button>
                          <button class="btn btn-sm btn-danger" (click)="deletePersonalTask(task.id)">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="personalTasks.length === 0">
                        <td colspan="5" class="text-center text-muted">No personal tasks found</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div class="modal fade" [class.show]="editingProject" [style.display]="editingProject ? 'block' : 'none'" 
         *ngIf="editingProject" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Project</h5>
            <button type="button" class="btn-close" (click)="cancelEdit()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Project Name</label>
              <input type="text" class="form-control" [(ngModel)]="editingProject.name">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" rows="3" [(ngModel)]="editingProject.description"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Due Date</label>
              <input type="date" class="form-control" [(ngModel)]="editingProject.dueDate">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="updateProject()">Update Project</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" [class.show]="editingProject" *ngIf="editingProject"></div>

    <!-- Edit Task Modal -->
    <div class="modal fade" [class.show]="editingTask" [style.display]="editingTask ? 'block' : 'none'" 
         *ngIf="editingTask" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Personal Task</h5>
            <button type="button" class="btn-close" (click)="cancelTaskEdit()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input type="text" class="form-control" [(ngModel)]="editingTask.title">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" rows="3" [(ngModel)]="editingTask.description"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Priority</label>
              <select class="form-select" [(ngModel)]="editingTask.priority">
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Due Date</label>
              <input type="date" class="form-control" [(ngModel)]="editingTask.dueDate">
            </div>
            <div class="mb-3">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="editingTask.status">
                <option>NOT_STARTED</option>
                <option>IN_PROGRESS</option>
                <option>DONE</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelTaskEdit()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="updatePersonalTask()">Update Task</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" [class.show]="editingTask" *ngIf="editingTask"></div>

    <!-- Toast Messages -->
    <div class="position-fixed bottom-0 end-0 p-3">
      <div class="toast align-items-center border-0" 
           [class.text-bg-success]="!toastError"
           [class.text-bg-danger]="toastError"
           [class.show]="showToast" role="alert">
        <div class="d-flex">
          <div class="toast-body">{{toastMessage}}</div>
          <button type="button" class="btn-close me-2 m-auto" (click)="hideToast()"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-tabs .nav-link.active {
      background-color: #0d6efd;
      color: white !important;
      border-color: #0d6efd;
    }
    .card {
      border: none;
      border-radius: 10px;
    }
    .table th {
      border-top: none;
    }
    .toast.show { display: block; }
    .toast { display: none; }
    .tab-content { min-height: 400px; }
  `]
})
export class ManagerDashboard implements OnInit {
  auth = inject(Auth);
  projectService = inject(ProjectService);
  subTaskService = inject(SubTaskService);
  todoService = inject(TodoService);
  router = inject(Router);

  currentUser: string = '';
  activeTab: string = 'overview';
  
  // Data
  projects: ProjectResponseModel[] = [];
  personalTasks: any[] = [];
  managerSubTasks: any[] = [];
  allUsers: any[] = [];
  projectMembers: any[] = [];
  editingProject: ProjectResponseModel | null = null;
  editingTask: any = null;
  
  // Form objects
  projectObj: ProjectRequestModel = new ProjectRequestModel();
  subTaskObj: SubTask = new SubTask();
  personalTaskObj: Task = new Task();
  
  // UI state
  newMemberUsername: string = '';
  selectedProject: ProjectResponseModel | null = null;
  showToast = false;
  toastMessage = '';
  toastError = false;
  selectedTlUsername: string = '';
  selectedMemberUsernames: string[] = [];

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Manager';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadProjects();
    this.loadPersonalTasks();
    this.loadManagerSubTasks();
    this.loadAllUsers();
  }

  loadProjects(): void {
    this.projectService.getProjectByLoggedInManager().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.projects = [];
      }
    });
  }

  loadPersonalTasks(): void {
    this.todoService.getAllTasks(0, 10).subscribe({
      next: (response: any) => {
        this.personalTasks = response.content || [];
      },
      error: (error) => {
        console.error('Error loading personal tasks:', error);
        this.personalTasks = [];
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  createProject(): void {
    if (!this.projectObj.name || !this.projectObj.dueDate || !this.selectedTlUsername || this.selectedMemberUsernames.length === 0) {
      this.showToastMessage('Please fill all required fields', true);
      return;
    }

    this.projectObj.tlUsername = this.selectedTlUsername;
    this.projectObj.memberUsernames = this.selectedMemberUsernames;
    
    this.projectService.createProject(this.projectObj).subscribe({
      next: (project) => {
        this.showToastMessage('Project created successfully!');
        this.resetProjectForm();
        this.loadProjects();
      },
      error: (error) => {
        this.showToastMessage('Error creating project: ' + (error.error?.error || 'Unknown error'), true);
      }
    });
  }

  loadAllUsers(): void {
    this.projectService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadProjectMembers(projectId: number): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.projectMembers = members;
      },
      error: (error) => {
        console.error('Error loading project members:', error);
      }
    });
  }

  editProject(project: ProjectResponseModel): void {
    this.editingProject = { ...project };
  }

  updateProject(): void {
    if (!this.editingProject) return;
    
    const updateData = {
      name: this.editingProject.name,
      description: this.editingProject.description,
      dueDate: this.editingProject.dueDate,
      tlUsername: this.editingProject.tlUsername,
      memberUsernames: this.editingProject.memberUsernames
    };
    
    this.projectService.updateProject(this.editingProject.id, updateData as any).subscribe({
      next: (updated) => {
        this.showToastMessage('Project updated successfully!');
        this.editingProject = null;
        this.loadProjects();
      },
      error: (error) => {
        this.showToastMessage('Error updating project', true);
      }
    });
  }

  cancelEdit(): void {
    this.editingProject = null;
  }

  createSubTask(): void {
    if (!this.subTaskObj.name || !this.subTaskObj.dueDate || !this.subTaskObj.projectId || !this.subTaskObj.assigneeUsername) {
      this.showToastMessage('Please fill all required fields', true);
      return;
    }

    this.subTaskService.createSubTask(this.subTaskObj).subscribe({
      next: (subtask) => {
        this.showToastMessage('Sub-task created successfully!');
        this.resetSubTaskForm();
        this.loadManagerSubTasks();
      },
      error: (error) => {
        this.showToastMessage('Error creating sub-task: ' + (error.error?.error || 'Unknown error'), true);
      }
    });
  }

  onProjectSelect(): void {
    if (this.subTaskObj.projectId) {
      this.loadProjectMembers(this.subTaskObj.projectId);
    }
  }

  createPersonalTask(): void {
    if (!this.personalTaskObj.title || !this.personalTaskObj.priority || !this.personalTaskObj.status) {
      this.showToastMessage('Please fill all required fields', true);
      return;
    }

    this.todoService.createTask(this.personalTaskObj).subscribe({
      next: (task) => {
        this.showToastMessage('Personal task created successfully!');
        this.resetPersonalTaskForm();
        this.loadPersonalTasks();
      },
      error: (error) => {
        this.showToastMessage('Error creating task: ' + (error.error?.error || 'Unknown error'), true);
      }
    });
  }

  openAddMemberModal(project: ProjectResponseModel): void {
    this.selectedProject = project;
    this.newMemberUsername = '';
  }

  addMemberToProject(): void {
    if (!this.selectedProject || !this.newMemberUsername) {
      this.showToastMessage('Please enter a member username', true);
      return;
    }

    this.projectService.addMember(this.selectedProject.id, this.newMemberUsername).subscribe({
      next: (updatedProject) => {
        this.showToastMessage('Member added successfully!');
        this.loadProjects();
        this.newMemberUsername = '';
      },
      error: (error) => {
        this.showToastMessage('Error adding member: ' + (error.error?.error || 'Unknown error'), true);
      }
    });
  }

  editPersonalTask(task: any): void {
    this.editingTask = { ...task };
    if (this.editingTask.dueDate) {
      this.editingTask.dueDate = this.editingTask.dueDate.split('T')[0];
    }
  }

  updatePersonalTask(): void {
    if (!this.editingTask) return;
    
    this.todoService.updateTask(this.editingTask.id, this.editingTask).subscribe({
      next: (updated) => {
        this.showToastMessage('Task updated successfully!');
        this.editingTask = null;
        this.loadPersonalTasks();
      },
      error: (error) => {
        this.showToastMessage('Error updating task', true);
      }
    });
  }

  cancelTaskEdit(): void {
    this.editingTask = null;
  }

  deletePersonalTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.todoService.deleteTask(taskId).subscribe({
        next: () => {
          this.showToastMessage('Task deleted successfully!');
          this.loadPersonalTasks();
        },
        error: (error) => {
          this.showToastMessage('Error deleting task', true);
        }
      });
    }
  }

  loadManagerSubTasks(): void {
    this.subTaskService.getSubTasksByManager().subscribe({
      next: (subtasks) => {
        this.managerSubTasks = subtasks;
      },
      error: (error) => {
        console.error('Error loading manager sub-tasks:', error);
        this.managerSubTasks = [];
      }
    });
  }

  updateSubTaskStatus(subtaskId: number, status: string): void {
    this.subTaskService.updateStatus(subtaskId, status).subscribe({
      next: (updatedSubtask) => {
        this.showToastMessage('Sub-task status updated successfully!');
        this.loadManagerSubTasks();
      },
      error: (error) => {
        this.showToastMessage('Error updating sub-task status', true);
      }
    });
  }

  // Helper methods
  getActiveSubTasksCount(): number {
    return this.managerSubTasks.filter(task => task.status !== 'DONE').length;
  }

  getTotalTeamMembers(): number {
    return this.projects.reduce((total, project) => total + project.memberUsernames.length, 0);
  }

  getCompletionPercentage(): number {
    // Mock calculation - in real app, fetch actual sub-task completion data
    return 68;
  }

  resetProjectForm(): void {
    this.projectObj = new ProjectRequestModel();
    this.selectedTlUsername = '';
    this.selectedMemberUsernames = [];
  }

  getTLUsers(): any[] {
    return this.allUsers.filter(user => user.role === 'TL');
  }

  getMemberUsers(): any[] {
    return this.allUsers.filter(user => user.role === 'MEMBER');
  }

  onMemberSelect(username: string, event: any): void {
    if (event.target.checked) {
      this.selectedMemberUsernames.push(username);
    } else {
      this.selectedMemberUsernames = this.selectedMemberUsernames.filter(u => u !== username);
    }
  }

  resetSubTaskForm(): void {
    this.subTaskObj = new SubTask();
  }

  resetPersonalTaskForm(): void {
    this.personalTaskObj = new Task();
  }

  showToastMessage(message: string, isError = false): void {
    this.toastMessage = message;
    this.toastError = isError;
    this.showToast = true;
    setTimeout(() => this.hideToast(), 5000);
  }

  hideToast(): void {
    this.showToast = false;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}