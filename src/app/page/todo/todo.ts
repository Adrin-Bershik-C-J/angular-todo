import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TodoService } from '../../service/todo';
import { SubTaskService } from '../../service/subtask';
import { Auth } from '../../service/auth';
import { Task, TaskResponse } from '../../model/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <span class="navbar-brand">Member Dashboard</span>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text me-3">Welcome, {{currentUser}}!</span>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container mt-4 mb-2">
      <!-- Tab Navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">
            Overview
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'personal'" (click)="setActiveTab('personal')">
            Personal Tasks
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'assigned'" (click)="setActiveTab('assigned')">
            Assigned Sub-Tasks
          </button>
        </li>
      </ul>

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content">
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5>Personal Tasks</h5>
                <h3>{{taskList.length}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h5>Completed Tasks</h5>
                <h3>{{getCompletedPersonalTasksCount()}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div class="card-body text-center">
                <h5>Assigned Sub-Tasks</h5>
                <h3>{{assignedSubTasks.length}}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5>Completed Sub-Tasks</h5>
                <h3>{{getCompletedSubTasksCount()}}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5>Recent Personal Tasks</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let task of taskList.slice(0, 5)" class="mb-2 p-2 border rounded">
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
                <div *ngIf="taskList.length === 0" class="text-muted">No personal tasks</div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5>Assigned Sub-Tasks</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let subtask of assignedSubTasks.slice(0, 5)" class="mb-2 p-2 border rounded">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{subtask.name}}</strong>
                      <small class="text-muted d-block">TL: {{subtask.tlUsername}}</small>
                    </div>
                    <span class="badge" [ngClass]="{
                      'bg-secondary': subtask.status === 'NOT_STARTED',
                      'bg-primary': subtask.status === 'IN_PROGRESS',
                      'bg-success': subtask.status === 'DONE'
                    }">{{subtask.status}}</span>
                  </div>
                </div>
                <div *ngIf="assignedSubTasks.length === 0" class="text-muted">No assigned sub-tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Tasks Tab -->
      <div *ngIf="activeTab === 'personal'" class="tab-content">
        <div class="row">
          <!-- Create Task -->
          <div class="col-md-5">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Create Personal Task</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="onCreateTask()">
                  <div class="mb-3">
                    <label class="form-label">Title</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="taskObj.title"
                      name="title"
                      required
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      rows="3"
                      [(ngModel)]="taskObj.description"
                      name="description"
                    ></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Priority</label>
                    <select
                      class="form-select"
                      [(ngModel)]="taskObj.priority"
                      name="priority"
                      required
                    >
                      <option value="">Select Priority</option>
                      <option>LOW</option>
                      <option>MEDIUM</option>
                      <option>HIGH</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Due Date</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="taskObj.dueDate"
                      name="dueDate"
                      [min]="getTodayDate()"
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select
                      class="form-select"
                      [(ngModel)]="taskObj.status"
                      name="status"
                    >
                      <option value="">Select Status</option>
                      <option>NOT_STARTED</option>
                      <option>IN_PROGRESS</option>
                      <option>DONE</option>
                    </select>
                  </div>

                  <button class="btn btn-success w-100" type="submit">
                    Add Task
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Personal Task List -->
          <div class="col-md-7 mt-4 mt-md-0">
            <div class="card shadow-sm">
              <div class="card-header bg-dark text-white">
                <h5 class="mb-0">Your Personal Tasks</h5>
              </div>
              <div class="card-body">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let task of taskList">
                      <td>{{task.title}}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': task.priority === 'LOW',
                          'bg-warning': task.priority === 'MEDIUM',
                          'bg-danger': task.priority === 'HIGH'
                        }">{{task.priority}}</span>
                      </td>
                      <td>
                        <span
                          class="badge"
                          [ngClass]="{
                            'bg-warning text-dark': task.status === 'NOT_STARTED',
                            'bg-primary': task.status === 'IN_PROGRESS',
                            'bg-success': task.status === 'DONE'
                          }"
                        >
                          {{task.status}}
                        </span>
                      </td>
                      <td>{{task.dueDate | date}}</td>
                      <td>
                        <button
                          class="btn btn-sm btn-primary me-2"
                          (click)="editPersonalTask(task)"
                        >
                          Edit
                        </button>
                        <button
                          class="btn btn-sm btn-danger"
                          (click)="onDeleteTask(task.id)"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="!taskList || taskList.length === 0">
                      <td colspan="5" class="text-center text-muted">
                        No tasks available.
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Pagination Controls -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <button
                    class="btn btn-outline-primary"
                    [disabled]="page === 0"
                    (click)="prevPage()"
                  >
                    Previous
                  </button>

                  <span> Page {{page + 1}} of {{totalPages}} </span>

                  <button
                    class="btn btn-outline-primary"
                    [disabled]="page >= totalPages - 1"
                    (click)="nextPage()"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'assigned'" class="tab-content">
        <div class="card shadow-sm">
          <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Sub-Tasks Assigned to Me</h5>
            <button class="btn btn-dark btn-sm" (click)="loadAssignedSubTasks()">
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
                    <th>Team Lead</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Project</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let subtask of assignedSubTasks">
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
                  <tr *ngIf="assignedSubTasks.length === 0">
                    <td colspan="7" class="text-center text-muted">No sub-tasks assigned to you</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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

    <!-- Toast Container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div
        id="liveToast"
        class="toast align-items-center border-0"
        [class.text-bg-success]="!toastError"
        [class.text-bg-danger]="toastError"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body" id="toastMessage">{{toastMessage}}</div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1100px;
    }
    .card {
      border-radius: 8px;
      border: none;
    }
    .table th,
    .table td {
      vertical-align: middle;
    }
    button i {
      margin-right: 4px;
    }
    .nav-tabs .nav-link.active {
      background-color: #0d6efd;
      color: white !important;
      border-color: #0d6efd;
    }
    .tab-content { 
      min-height: 400px; 
    }
    .btn-group-sm .btn {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class Todo implements OnInit {
  router = inject(Router);
  todoService = inject(TodoService);
  subTaskService = inject(SubTaskService);
  auth = inject(Auth);

  currentUser: string = '';
  activeTab: string = 'overview';

  taskObj: Task = new Task();
  taskList: TaskResponse[] = [];
  assignedSubTasks: any[] = [];

  // edit state
  editTaskObj: any = {};
  editingTaskId: number | null = null;
  editingTask: any = null;

  // pagination variables
  page: number = 0;
  size: number = 5;
  totalPages: number = 0;

  // toast state
  toastMessage: string = '';
  toastError: boolean = false;

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Member';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadTasks();
    this.loadAssignedSubTasks();
  }

  loadTasks(page: number = 0): void {
    this.todoService.getAllTasks(page, this.size).subscribe({
      next: (res: any) => {
        this.taskList = res.content || [];
        this.page = res.number;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        this.showToast('Error loading tasks', true);
      },
    });
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'assigned') {
      this.loadAssignedSubTasks();
    }
  }

  // Personal task methods
  onCreateTask(): void {
    this.todoService.createTask(this.taskObj).subscribe({
      next: () => {
        this.showToast('Task created successfully');
        this.taskObj = new Task();
        this.loadTasks();
      },
      error: () => {
        this.showToast('Error creating task', true);
      },
    });
  }

  onDeleteTask(id: number): void {
    if (confirm('Do you want to delete the task?')) {
      this.todoService.deleteTask(id).subscribe({
        next: () => {
          this.showToast('Task deleted successfully');
          this.loadTasks();
        },
        error: () => {
          this.showToast('Error deleting task', true);
        },
      });
    }
  }

  editPersonalTask(task: TaskResponse): void {
    this.editingTask = { ...task };
    if (this.editingTask.dueDate) {
      this.editingTask.dueDate = this.editingTask.dueDate.split('T')[0];
    }
  }

  updatePersonalTask(): void {
    if (!this.editingTask) return;
    
    this.todoService.updateTask(this.editingTask.id, this.editingTask).subscribe({
      next: (updated) => {
        this.showToast('Task updated successfully!');
        this.editingTask = null;
        this.loadTasks();
      },
      error: (error) => {
        this.showToast('Error updating task', true);
      }
    });
  }

  cancelTaskEdit(): void {
    this.editingTask = null;
  }

  onUpdateTask(): void {
    if (!this.editingTaskId) return;

    const payload: any = { ...this.editTaskObj };
    if (payload.dueDate) {
      const dateOnly = payload.dueDate.split('T')[0];
      payload.dueDate = new Date(dateOnly).toISOString();
    }

    this.todoService.updateTask(this.editingTaskId, payload).subscribe({
      next: () => {
        this.showToast('Task updated successfully');
        this.loadTasks();
        this.editingTaskId = null;
      },
      error: () => {
        this.showToast('Error updating task', true);
      },
    });
  }

  // Sub-task methods
  updateSubTaskStatus(subtaskId: number, status: string): void {
    this.subTaskService.updateStatus(subtaskId, status as any).subscribe({
      next: (updatedSubtask) => {
        this.showToast('Sub-task status updated successfully!');
        this.loadAssignedSubTasks();
      },
      error: (error) => {
        this.showToast('Error updating sub-task status', true);
      }
    });
  }

  // Statistics helpers
  getCompletedPersonalTasksCount(): number {
    return this.taskList.filter(task => task.status === 'DONE').length;
  }

  getCompletedSubTasksCount(): number {
    return this.assignedSubTasks.filter(task => task.status === 'DONE').length;
  }

  // Pagination
  nextPage(): void {
    if (this.page < this.totalPages - 1) this.loadTasks(this.page + 1);
  }

  prevPage(): void {
    if (this.page > 0) this.loadTasks(this.page - 1);
  }

  // Toast function
  showToast(message: string, isError: boolean = false): void {
    this.toastMessage = message;
    this.toastError = isError;
    
    const toastEl = document.getElementById('liveToast');
    if (toastEl) {
      // Use Bootstrap's Toast class if available, otherwise just show the element
      if (typeof (window as any).bootstrap !== 'undefined') {
        const toast = new (window as any).bootstrap.Toast(toastEl);
        toast.show();
      } else {
        toastEl.style.display = 'block';
        setTimeout(() => {
          toastEl.style.display = 'none';
        }, 3000);
      }
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}