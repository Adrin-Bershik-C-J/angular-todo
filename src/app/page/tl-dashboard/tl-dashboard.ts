import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { SubTaskService } from '../../service/subtask';
import { TodoService } from '../../service/todo';
import { ProjectService } from '../../service/project';
import { Task } from '../../model/todo.model';
import { SubTask } from '../../model/subtask.model';

@Component({
  selector: 'app-tl-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <span class="navbar-brand">Team Lead Dashboard</span>
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
          <button class="nav-link" [class.active]="activeTab === 'assigned-subtasks'" (click)="setActiveTab('assigned-subtasks')">
            Assigned Sub-Tasks
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'create-subtask'" (click)="setActiveTab('create-subtask')">
            Create Sub-Task
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'personal'" (click)="setActiveTab('personal')">
            Personal Tasks
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'team'" (click)="setActiveTab('team')">
            Team Performance
          </button>
        </li>
      </ul>

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content">
        <!-- Project Filter -->
        <div class="row mb-3">
          <div class="col-md-4">
            <label class="form-label">Filter by Project:</label>
            <select class="form-select" [(ngModel)]="selectedProjectId" (change)="onProjectFilterChange()">
              <option [value]="null">All Projects</option>
              <option *ngFor="let project of tlProjects" [value]="project.id">{{project.name}}</option>
            </select>
          </div>
        </div>
        
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5>Assigned Sub-Tasks</h5>
                <h3>{{getFilteredSubTasks().length}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h5>Completed</h5>
                <h3>{{getCompletedSubTasksCount()}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div class="card-body text-center">
                <h5>In Progress</h5>
                <h3>{{getInProgressSubTasksCount()}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5>Personal Tasks</h5>
                <h3>{{personalTasks.length}}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5>Recent Sub-Tasks</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let subtask of assignedSubTasks.slice(0, 5)" class="mb-2 p-2 border rounded">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{subtask.name}}</strong>
                      <small class="text-muted d-block">Assigned to: {{subtask.memberUsername}}</small>
                    </div>
                    <span class="badge" [ngClass]="{
                      'bg-secondary': subtask.status === 'NOT_STARTED',
                      'bg-primary': subtask.status === 'IN_PROGRESS',
                      'bg-success': subtask.status === 'DONE'
                    }">{{subtask.status}}</span>
                  </div>
                </div>
                <div *ngIf="assignedSubTasks.length === 0" class="text-muted">No sub-tasks assigned</div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5>Team Progress</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <small>Overall Completion</small>
                  <div class="progress">
                    <div class="progress-bar bg-success" [style.width.%]="getTeamCompletionPercentage()"></div>
                  </div>
                  <small class="text-muted">{{getTeamCompletionPercentage()}}% Complete</small>
                </div>
                <div class="mt-3">
                  <h6>Upcoming Deadlines</h6>
                  <div *ngFor="let task of getUpcomingDeadlines()" class="small">
                    <span class="badge bg-warning me-2">{{task.dueDate | date:'short'}}</span>
                    {{task.name}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'assigned-subtasks'" class="tab-content">
        <!-- Project Filter -->
        <div class="row mb-3">
          <div class="col-md-4">
            <label class="form-label">Filter by Project:</label>
            <select class="form-select" [(ngModel)]="selectedProjectId" (change)="onProjectFilterChange()">
              <option [value]="null">All Projects</option>
              <option *ngFor="let project of tlProjects" [value]="project.id">{{project.name}}</option>
            </select>
          </div>
        </div>
        
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Project Sub-Tasks</h5>
            <button class="btn btn-light btn-sm" (click)="loadAssignedSubTasks()">
              Refresh
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Project</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let subtask of getFilteredSubTasks()">
                    <td>
                      <strong>{{subtask.name}}</strong>
                    </td>
                    <td>
                      <small>{{subtask.description || 'No description'}}</small>
                    </td>
                    <td>{{subtask.memberUsername}}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-secondary': subtask.status === 'NOT_STARTED',
                        'bg-primary': subtask.status === 'IN_PROGRESS',
                        'bg-success': subtask.status === 'DONE'
                      }">{{subtask.status}}</span>
                    </td>
                    <td>{{subtask.dueDate | date}}</td>
                    <td>
                      <small>{{subtask.projectName}}</small>
                    </td>
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
                  <tr *ngIf="getFilteredSubTasks().length === 0">
                    <td colspan="7" class="text-center text-muted">No sub-tasks found for selected project</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Sub-Task Tab -->
      <div *ngIf="activeTab === 'create-subtask'" class="tab-content">
        <div class="row">
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header bg-success text-white">
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
                      <option *ngFor="let project of getAvailableProjects()" [value]="project.id">{{project.name}}</option>
                    </select>
                    <small class="text-muted">Select from projects you're assigned to</small>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Assign To</label>
                    <select class="form-select" [(ngModel)]="subTaskObj.assigneeUsername" name="assigneeUsername" required>
                      <option value="">Select Assignee</option>
                      <option *ngFor="let member of projectMembers" [value]="member.username">
                        {{member.name}} ({{member.username}}) - {{member.role}}
                      </option>
                    </select>
                    <small class="text-muted">Choose from project team members</small>
                  </div>
                  <button type="submit" class="btn btn-success w-100">Create Sub-Task</button>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header bg-info text-white">
                <h5 class="mb-0">Instructions</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <h6>Creating Sub-Tasks</h6>
                  <ul class="mb-0">
                    <li>Ensure you are assigned as TL to the project</li>
                    <li>Member must be part of the project team</li>
                    <li>Due date should be reasonable for the project timeline</li>
                    <li>Sub-tasks help break down project work into manageable pieces</li>
                  </ul>
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

      <!-- Team Performance Tab -->
      <div *ngIf="activeTab === 'team'" class="tab-content">
        <!-- Project Filter -->
        <div class="row mb-3">
          <div class="col-md-4">
            <label class="form-label">Filter by Project:</label>
            <select class="form-select" [(ngModel)]="selectedProjectId" (change)="onProjectFilterChange()">
              <option [value]="null">All Projects</option>
              <option *ngFor="let project of tlProjects" [value]="project.id">{{project.name}}</option>
            </select>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header bg-info text-white">
                <h5 class="mb-0">Team Members Performance</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let member of getTeamMembers()" class="mb-3 p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">{{member.name}}</h6>
                      <small class="text-muted">{{member.assignedTasks}} tasks assigned</small>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-success">{{member.completedTasks}} completed</span>
                    </div>
                  </div>
                  <div class="progress mt-2">
                    <div class="progress-bar" [style.width.%]="member.completionRate"></div>
                  </div>
                  <small class="text-muted">{{member.completionRate}}% completion rate</small>
                </div>
                <div *ngIf="getTeamMembers().length === 0" class="text-muted">
                  No team member data available
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">Project Status</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <h6>Overall Progress</h6>
                  <div class="progress">
                    <div class="progress-bar bg-success" [style.width.%]="getTeamCompletionPercentage()"></div>
                  </div>
                  <small class="text-muted">{{getTeamCompletionPercentage()}}% of all sub-tasks completed</small>
                </div>
                
                <div class="mt-4">
                  <h6>Task Status Breakdown</h6>
                  <div class="row text-center">
                    <div class="col-4">
                      <div class="badge bg-secondary fs-6">{{getNotStartedCount()}}</div>
                      <small class="d-block text-muted">Not Started</small>
                    </div>
                    <div class="col-4">
                      <div class="badge bg-primary fs-6">{{getInProgressSubTasksCount()}}</div>
                      <small class="d-block text-muted">In Progress</small>
                    </div>
                    <div class="col-4">
                      <div class="badge bg-success fs-6">{{getCompletedSubTasksCount()}}</div>
                      <small class="d-block text-muted">Completed</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
    .btn-group-sm .btn {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class TlDashboard implements OnInit {
  auth = inject(Auth);
  subTaskService = inject(SubTaskService);
  todoService = inject(TodoService);
  projectService = inject(ProjectService);
  router = inject(Router);

  currentUser: string = '';
  activeTab: string = 'overview';
  
  // Data
  assignedSubTasks: any[] = [];
  personalTasks: any[] = [];
  allUsers: any[] = [];
  projectMembers: any[] = [];
  tlProjects: any[] = [];
  selectedProjectId: number | null = null;
  editingTask: any = null;
  
  // Form objects
  personalTaskObj: Task = new Task();
  subTaskObj: SubTask = new SubTask();
  
  // UI state
  showToast = false;
  toastMessage = '';
  toastError = false;

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Team Lead';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadAssignedSubTasks();
    this.loadPersonalTasks();
    this.loadAllUsers();
    this.loadTLProjects();
  }

  loadTLProjects(): void {
    this.projectService.getProjectsByTL().subscribe({
      next: (projects) => {
        this.tlProjects = projects;
      },
      error: (error) => {
        console.error('Error loading TL projects:', error);
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

  onProjectSelect(): void {
    if (this.subTaskObj.projectId) {
      this.loadProjectMembers(this.subTaskObj.projectId);
    }
  }

  getAvailableProjects(): any[] {
    return this.tlProjects;
  }

  loadAssignedSubTasks(): void {
    this.subTaskService.getSubTasksByTL().subscribe({
      next: (subtasks) => {
        this.assignedSubTasks = subtasks;
      },
      error: (error) => {
        console.error('Error loading assigned sub-tasks:', error);
        this.assignedSubTasks = [];
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

  updateSubTaskStatus(subtaskId: number, status: string): void {
    this.subTaskService.updateStatus(subtaskId, status as any).subscribe({
      next: (updatedSubtask) => {
        this.showToastMessage('Sub-task status updated successfully!');
        this.loadAssignedSubTasks();
      },
      error: (error) => {
        this.showToastMessage('Error updating sub-task status', true);
      }
    });
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
        this.loadAssignedSubTasks();
      },
      error: (error) => {
        this.showToastMessage('Error creating sub-task: ' + (error.error?.error || 'Unknown error'), true);
      }
    });
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

  onProjectFilterChange(): void {
    // Refresh stats when project filter changes
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

  // Helper methods for statistics
  getFilteredSubTasks(): any[] {
    if (!this.selectedProjectId) return this.assignedSubTasks;
    return this.assignedSubTasks.filter(task => task.projectId === this.selectedProjectId);
  }

  getCompletedSubTasksCount(): number {
    return this.getFilteredSubTasks().filter(task => task.status === 'DONE').length;
  }

  getInProgressSubTasksCount(): number {
    return this.getFilteredSubTasks().filter(task => task.status === 'IN_PROGRESS').length;
  }

  getNotStartedCount(): number {
    return this.getFilteredSubTasks().filter(task => task.status === 'NOT_STARTED').length;
  }

  getTeamCompletionPercentage(): number {
    const filteredTasks = this.getFilteredSubTasks();
    if (filteredTasks.length === 0) return 0;
    return Math.round((this.getCompletedSubTasksCount() / filteredTasks.length) * 100);
  }

  getUpcomingDeadlines(): any[] {
    const upcoming = this.getFilteredSubTasks()
      .filter(task => task.status !== 'DONE' && new Date(task.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
    return upcoming;
  }

  getTeamMembers(): any[] {
    // Group sub-tasks by member and calculate stats
    const memberStats = new Map();
    
    this.getFilteredSubTasks().forEach(subtask => {
      const memberName = subtask.memberUsername;
      if (!memberStats.has(memberName)) {
        memberStats.set(memberName, {
          name: memberName,
          assignedTasks: 0,
          completedTasks: 0,
          completionRate: 0
        });
      }
      
      const stats = memberStats.get(memberName);
      stats.assignedTasks++;
      if (subtask.status === 'DONE') {
        stats.completedTasks++;
      }
      stats.completionRate = stats.assignedTasks > 0 ? 
        Math.round((stats.completedTasks / stats.assignedTasks) * 100) : 0;
    });

    return Array.from(memberStats.values());
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