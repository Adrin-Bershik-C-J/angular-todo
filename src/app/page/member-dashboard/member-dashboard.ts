import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { SubTaskService } from '../../service/subtask';
import { TodoService } from '../../service/todo';
import { Task } from '../../model/todo.model';

@Component({
  selector: 'app-member-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container">
        <span class="navbar-brand text-primary fw-bold">Member Dashboard</span>
        <button class="navbar-toggler" type="button" (click)="toggleNavbar()">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [class.show]="isNavbarCollapsed" id="navbarNav">
          <div class="navbar-nav ms-auto d-flex align-items-center">
            <button class="nav-link btn btn-link" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">
              Overview
            </button>
            <button class="nav-link btn btn-link" [class.active]="activeTab === 'assigned-subtasks'" (click)="setActiveTab('assigned-subtasks')">
              Assigned Sub-Tasks
            </button>
            <button class="nav-link btn btn-link" [class.active]="activeTab === 'personal'" (click)="setActiveTab('personal')">
              Personal Tasks
            </button>
            <span class="navbar-text me-3 text-dark ms-3">Welcome, {{currentUser}}!</span>
            <button class="btn btn-outline-primary btn-sm" (click)="logout()">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4">

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content">
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5>Assigned Sub-Tasks</h5>
                <h3>{{assignedSubTasks.length}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h5>Completed Sub-Tasks</h5>
                <h3>{{getCompletedSubTasksCount()}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div class="card-body text-center">
                <h5>Personal Tasks</h5>
                <h3>{{personalTasks.length}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5>Completed Personal</h5>
                <h3>{{getCompletedPersonalTasksCount()}}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5>Upcoming Sub-Task Deadlines</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let subtask of getUpcomingSubTaskDeadlines()" class="mb-2 p-2 border rounded">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{subtask.name}}</strong>
                      <small class="text-muted d-block">Due: {{subtask.dueDate | date}} | TL: {{subtask.tlUsername}}</small>
                    </div>
                    <span class="badge" [ngClass]="{
                      'bg-secondary': subtask.status === 'NOT_STARTED',
                      'bg-primary': subtask.status === 'IN_PROGRESS',
                      'bg-success': subtask.status === 'DONE'
                    }">{{subtask.status}}</span>
                  </div>
                </div>
                <div *ngIf="getUpcomingSubTaskDeadlines().length === 0" class="text-muted">No upcoming sub-task deadlines</div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5>Upcoming Personal Task Deadlines</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let task of getUpcomingPersonalTaskDeadlines()" class="mb-2 p-2 border rounded">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{task.title}}</strong>
                      <small class="text-muted d-block">Due: {{task.dueDate | date}}</small>
                    </div>
                    <span class="badge" [ngClass]="{
                      'bg-secondary': task.status === 'NOT_STARTED',
                      'bg-primary': task.status === 'IN_PROGRESS',
                      'bg-success': task.status === 'DONE'
                    }">{{task.status}}</span>
                  </div>
                </div>
                <div *ngIf="getUpcomingPersonalTaskDeadlines().length === 0" class="text-muted">No upcoming personal task deadlines</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'assigned-subtasks'" class="tab-content">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Sub-Tasks Assigned to Me</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4">
                <select class="form-select form-select-sm" [(ngModel)]="subTaskStatusFilter">
                  <option value="">All Status</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div class="col-md-4">
                <input type="date" class="form-control form-control-sm" [(ngModel)]="subTaskDueDateFilter" placeholder="Filter by due date">
              </div>
              <div class="col-md-4">
                <select class="form-select form-select-sm" [(ngModel)]="subTaskProjectFilter">
                  <option value="">All Projects</option>
                  <option *ngFor="let project of getUniqueProjects()" [value]="project.id">{{project.name}}</option>
                </select>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Team Lead</th>
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
                    <td>{{subtask.tlUsername}}</td>
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
                    <td colspan="7" class="text-center text-muted">No sub-tasks assigned to you</td>
                  </tr>
                </tbody>
              </table>
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
                <div class="row mb-3">
                  <div class="col-md-4">
                    <select class="form-select form-select-sm" [(ngModel)]="taskPriorityFilter">
                      <option value="">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <select class="form-select form-select-sm" [(ngModel)]="taskStatusFilter">
                      <option value="">All Status</option>
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="taskDueDateFilter" placeholder="Filter by due date">
                  </div>
                </div>
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
                      <tr *ngFor="let task of getFilteredPersonalTasks()">
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
                      <tr *ngIf="getFilteredPersonalTasks().length === 0">
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

    <!-- Edit Task Modal -->
    <div class="modal fade" [class.show]="editingTask" [style.display]="editingTask ? 'block' : 'none'" 
         *ngIf="editingTask" tabindex="-1" (keydown.escape)="cancelTaskEdit()" (click)="onTaskModalBackdropClick($event)">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
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
              <input type="date" class="form-control" [(ngModel)]="editingTask.dueDate" [min]="getTodayDate()">
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
    .nav-link.active {
      background-color: #0d6efd !important;
      color: white !important;
      border-radius: 5px;
    }
    .nav-link {
      color: #0d6efd;
      margin-right: 0.5rem;
      text-decoration: none;
      border: none;
      background: none;
    }
    .nav-link:hover {
      color: #0a58ca;
      background-color: #e7f1ff;
      border-radius: 5px;
    }
    .card {
      border-radius: 10px;
    }
    .table th {
      border-top: none;
      font-weight: 600;
    }
    .toast.show { display: block; }
    .toast { display: none; }
    .tab-content { min-height: 400px; }
    @media (max-width: 991.98px) {
      .navbar-collapse {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 250px;
        z-index: 1000;
      }
      .navbar-nav {
        flex-direction: column;
        padding: 1rem;
      }
      .nav-link {
        padding: 0.5rem 1rem;
        margin: 0.2rem 0;
        border-radius: 5px;
      }
    }
  `]
})
export class MemberDashboard implements OnInit {
  auth = inject(Auth);
  subTaskService = inject(SubTaskService);
  todoService = inject(TodoService);
  router = inject(Router);

  currentUser: string = '';
  activeTab: string = 'overview';
  
  // Data
  assignedSubTasks: any[] = [];
  personalTasks: any[] = [];
  editingTask: any = null;
  
  // Form objects
  personalTaskObj: Task = new Task();
  
  // UI state
  showToast = false;
  toastMessage = '';
  toastError = false;
  isNavbarCollapsed = false;
  taskPriorityFilter: string = '';
  taskStatusFilter: string = '';
  taskDueDateFilter: string = '';
  subTaskStatusFilter: string = '';
  subTaskDueDateFilter: string = '';
  subTaskProjectFilter: string = '';

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Member';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadAssignedSubTasks();
    this.loadPersonalTasks();
  }

  loadAssignedSubTasks(): void {
    this.subTaskService.getSubTasksByMember().subscribe({
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

  onTaskModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelTaskEdit();
    }
  }

  getFilteredPersonalTasks(): any[] {
    return this.personalTasks.filter(task => {
      const priorityMatch = !this.taskPriorityFilter || task.priority === this.taskPriorityFilter;
      const statusMatch = !this.taskStatusFilter || task.status === this.taskStatusFilter;
      const dueDateMatch = !this.taskDueDateFilter || task.dueDate?.split('T')[0] === this.taskDueDateFilter;
      return priorityMatch && statusMatch && dueDateMatch;
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

  // Helper methods for statistics
  getCompletedPersonalTasksCount(): number {
    return this.personalTasks.filter(task => task.status === 'DONE').length;
  }

  getCompletedSubTasksCount(): number {
    return this.assignedSubTasks.filter(task => task.status === 'DONE').length;
  }

  getFilteredSubTasks(): any[] {
    return this.assignedSubTasks.filter(subtask => {
      const statusMatch = !this.subTaskStatusFilter || subtask.status === this.subTaskStatusFilter;
      const dueDateMatch = !this.subTaskDueDateFilter || subtask.dueDate?.split('T')[0] === this.subTaskDueDateFilter;
      const projectMatch = !this.subTaskProjectFilter || subtask.projectId === Number(this.subTaskProjectFilter);
      return statusMatch && dueDateMatch && projectMatch;
    });
  }

  getUniqueProjects(): any[] {
    const projects = new Map();
    this.assignedSubTasks.forEach(subtask => {
      if (subtask.projectId && subtask.projectName) {
        projects.set(subtask.projectId, { id: subtask.projectId, name: subtask.projectName });
      }
    });
    return Array.from(projects.values());
  }

  getUpcomingSubTaskDeadlines(): any[] {
    return this.assignedSubTasks
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }

  getUpcomingPersonalTaskDeadlines(): any[] {
    return this.personalTasks
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
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

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}