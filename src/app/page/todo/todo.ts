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
    <!-- Header Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <span class="navbar-brand">
          <i class="feather icon-layers me-2"></i>
          Member Dashboard
        </span>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text me-3">
            <i class="feather icon-user me-1"></i>
            Welcome, {{currentUser}}!
          </span>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">
            <i class="feather icon-log-out me-1"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container-fluid mt-4 mb-4">
      <!-- Tab Navigation -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body p-0">
              <ul class="nav nav-tabs border-0">
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">
                    <i class="feather icon-pie-chart me-2"></i>
                    Overview
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'personal'" (click)="setActiveTab('personal')">
                    <i class="feather icon-user me-2"></i>
                    Personal Tasks
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" [class.active]="activeTab === 'assigned'" (click)="setActiveTab('assigned')">
                    <i class="feather icon-users me-2"></i>
                    Assigned Sub-Tasks
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content fade-in-up">
        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-6 col-xl-3">
            <div class="card order-card bg-c-blue">
              <div class="card-body">
                <h6 class="text-white">Personal Tasks</h6>
                <h2 class="text-end text-white">
                  <i class="feather icon-clipboard float-start"></i>
                  <span>{{taskList.length}}</span>
                </h2>
                <p class="m-b-0">
                  Total Tasks
                  <span class="float-end">{{taskList.length}}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="card order-card bg-c-green">
              <div class="card-body">
                <h6 class="text-white">Completed Tasks</h6>
                <h2 class="text-end text-white">
                  <i class="feather icon-check-circle float-start"></i>
                  <span>{{getCompletedPersonalTasksCount()}}</span>
                </h2>
                <p class="m-b-0">
                  Finished
                  <span class="float-end">{{getCompletedPersonalTasksCount()}}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="card order-card bg-c-yellow">
              <div class="card-body">
                <h6 class="text-white">Assigned Sub-Tasks</h6>
                <h2 class="text-end text-white">
                  <i class="feather icon-users float-start"></i>
                  <span>{{assignedSubTasks.length}}</span>
                </h2>
                <p class="m-b-0">
                  Assigned
                  <span class="float-end">{{assignedSubTasks.length}}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="card order-card bg-c-red">
              <div class="card-body">
                <h6 class="text-white">Completed Sub-Tasks</h6>
                <h2 class="text-end text-white">
                  <i class="feather icon-award float-start"></i>
                  <span>{{getCompletedSubTasksCount()}}</span>
                </h2>
                <p class="m-b-0">
                  Done
                  <span class="float-end">{{getCompletedSubTasksCount()}}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Overview Cards -->
        <div class="row">
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="feather icon-list me-2"></i>
                  Recent Personal Tasks
                </h5>
              </div>
              <div class="card-body">
                <div *ngFor="let task of taskList.slice(0, 5)" class="mb-3 p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{task.title}}</h6>
                      <small class="text-muted">
                        <i class="feather icon-calendar me-1"></i>
                        Due: {{task.dueDate | date}}
                      </small>
                      <div class="mt-1">
                        <small class="text-muted">
                          <i class="feather icon-flag me-1"></i>
                          {{task.priority}}
                        </small>
                      </div>
                    </div>
                    <span class="badge" [ngClass]="{
                      'bg-secondary': task.status === 'NOT_STARTED',
                      'bg-primary': task.status === 'IN_PROGRESS',
                      'bg-success': task.status === 'DONE'
                    }">{{task.status}}</span>
                  </div>
                </div>
                <div *ngIf="taskList.length === 0" class="text-center py-4">
                  <i class="feather icon-inbox text-muted" style="font-size: 48px;"></i>
                  <p class="text-muted mt-2">No personal tasks</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="feather icon-users me-2"></i>
                  Assigned Sub-Tasks
                </h5>
              </div>
              <div class="card-body">
                <div *ngFor="let subtask of assignedSubTasks.slice(0, 5)" class="mb-3 p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{subtask.name}}</h6>
                      <small class="text-muted">
                        <i class="feather icon-user me-1"></i>
                        Team Lead: {{subtask.tlUsername}}
                      </small>
                    </div>
                    <span class="badge" [ngClass]="{
                      'bg-secondary': subtask.status === 'NOT_STARTED',
                      'bg-primary': subtask.status === 'IN_PROGRESS',
                      'bg-success': subtask.status === 'DONE'
                    }">{{subtask.status}}</span>
                  </div>
                </div>
                <div *ngIf="assignedSubTasks.length === 0" class="text-center py-4">
                  <i class="feather icon-user-x text-muted" style="font-size: 48px;"></i>
                  <p class="text-muted mt-2">No assigned sub-tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Tasks Tab -->
      <div *ngIf="activeTab === 'personal'" class="tab-content fade-in-up">
        <div class="row">
          <!-- Create Task Form -->
          <div class="col-lg-5">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="feather icon-plus-circle me-2"></i>
                  Create Personal Task
                </h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="onCreateTask()">
                  <div class="mb-3">
                    <label class="form-label">
                      <i class="feather icon-edit-3 me-1"></i>
                      Title
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="taskObj.title"
                      name="title"
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">
                      <i class="feather icon-file-text me-1"></i>
                      Description
                    </label>
                    <textarea
                      class="form-control"
                      rows="3"
                      [(ngModel)]="taskObj.description"
                      name="description"
                      placeholder="Enter task description"
                    ></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">
                      <i class="feather icon-flag me-1"></i>
                      Priority
                    </label>
                    <select
                      class="form-select"
                      [(ngModel)]="taskObj.priority"
                      name="priority"
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="LOW">🟢 Low</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="HIGH">🔴 High</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">
                      <i class="feather icon-calendar me-1"></i>
                      Due Date
                    </label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="taskObj.dueDate"
                      name="dueDate"
                      [min]="getTodayDate()"
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">
                      <i class="feather icon-activity me-1"></i>
                      Status
                    </label>
                    <select
                      class="form-select"
                      [(ngModel)]="taskObj.status"
                      name="status"
                    >
                      <option value="">Select Status</option>
                      <option value="NOT_STARTED">⏸️ Not Started</option>
                      <option value="IN_PROGRESS">▶️ In Progress</option>
                      <option value="DONE">✅ Done</option>
                    </select>
                  </div>

                  <button class="btn btn-success w-100" type="submit">
                    <i class="feather icon-plus me-2"></i>
                    Add Task
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Personal Task List -->
          <div class="col-lg-7 mt-4 mt-lg-0">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="feather icon-list me-2"></i>
                  Your Personal Tasks
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th><i class="feather icon-edit-3 me-1"></i>Title</th>
                        <th><i class="feather icon-flag me-1"></i>Priority</th>
                        <th><i class="feather icon-activity me-1"></i>Status</th>
                        <th><i class="feather icon-calendar me-1"></i>Due Date</th>
                        <th><i class="feather icon-settings me-1"></i>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                    <tr *ngFor="let task of taskList">
                      <td>
                        <div>
                          <h6 class="mb-1">{{task.title}}</h6>
                          <small class="text-muted">{{task.description || 'No description'}}</small>
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-success': task.priority === 'LOW',
                          'bg-warning': task.priority === 'MEDIUM',
                          'bg-danger': task.priority === 'HIGH'
                        }">
                          <i class="feather icon-flag me-1"></i>
                          {{task.priority}}
                        </span>
                      </td>
                      <td>
                        <span
                          class="badge"
                          [ngClass]="{
                            'bg-secondary': task.status === 'NOT_STARTED',
                            'bg-primary': task.status === 'IN_PROGRESS',
                            'bg-success': task.status === 'DONE'
                          }"
                        >
                          <i class="feather" [ngClass]="{
                            'icon-pause': task.status === 'NOT_STARTED',
                            'icon-play': task.status === 'IN_PROGRESS',
                            'icon-check': task.status === 'DONE'
                          }" style="margin-right: 4px;"></i>
                          {{task.status}}
                        </span>
                      </td>
                      <td>
                        <small>
                          <i class="feather icon-calendar me-1"></i>
                          {{task.dueDate | date}}
                        </small>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-primary"
                            (click)="editPersonalTask(task)"
                            title="Edit Task"
                          >
                            <i class="feather icon-edit"></i>
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            (click)="onDeleteTask(task.id)"
                            title="Delete Task"
                          >
                            <i class="feather icon-trash-2"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="!taskList || taskList.length === 0">
                      <td colspan="5" class="text-center py-4">
                        <i class="feather icon-inbox text-muted" style="font-size: 48px;"></i>
                        <p class="text-muted mt-2 mb-0">No tasks available</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>

                <!-- Pagination Controls -->
                <div class="card-footer bg-light">
                  <div class="d-flex justify-content-between align-items-center">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      [disabled]="page === 0"
                      (click)="prevPage()"
                    >
                      <i class="feather icon-chevron-left me-1"></i>
                      Previous
                    </button>

                    <span class="text-muted">
                      <i class="feather icon-file-text me-1"></i>
                      Page {{page + 1}} of {{totalPages}}
                    </span>

                    <button
                      class="btn btn-outline-primary btn-sm"
                      [disabled]="page >= totalPages - 1"
                      (click)="nextPage()"
                    >
                      Next
                      <i class="feather icon-chevron-right ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'assigned'" class="tab-content fade-in-up">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="feather icon-users me-2"></i>
              Sub-Tasks Assigned to Me
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th><i class="feather icon-edit-3 me-1"></i>Name</th>
                    <th><i class="feather icon-file-text me-1"></i>Description</th>
                    <th><i class="feather icon-user me-1"></i>Team Lead</th>
                    <th><i class="feather icon-activity me-1"></i>Status</th>
                    <th><i class="feather icon-calendar me-1"></i>Due Date</th>
                    <th><i class="feather icon-folder me-1"></i>Project</th>
                    <th><i class="feather icon-settings me-1"></i>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let subtask of assignedSubTasks">
                    <td>
                      <div>
                        <h6 class="mb-1">{{subtask.name}}</h6>
                      </div>
                    </td>
                    <td>
                      <small class="text-muted">{{subtask.description || 'No description'}}</small>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <i class="feather icon-user-check me-2 text-primary"></i>
                        <span>{{subtask.tlUsername}}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-secondary': subtask.status === 'NOT_STARTED',
                        'bg-primary': subtask.status === 'IN_PROGRESS',
                        'bg-success': subtask.status === 'DONE'
                      }">
                        <i class="feather" [ngClass]="{
                          'icon-pause': subtask.status === 'NOT_STARTED',
                          'icon-play': subtask.status === 'IN_PROGRESS',
                          'icon-check': subtask.status === 'DONE'
                        }" style="margin-right: 4px;"></i>
                        {{subtask.status}}
                      </span>
                    </td>
                    <td>
                      <small>
                        <i class="feather icon-calendar me-1"></i>
                        {{subtask.dueDate | date}}
                      </small>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <i class="feather icon-folder me-2 text-info"></i>
                        <small>{{subtask.projectName}}</small>
                      </div>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn" 
                                [ngClass]="subtask.status === 'NOT_STARTED' ? 'btn-secondary' : 'btn-outline-secondary'"
                                (click)="updateSubTaskStatus(subtask.id, 'NOT_STARTED')"
                                [disabled]="subtask.status === 'NOT_STARTED'"
                                title="Mark as Not Started">
                          <i class="feather icon-pause"></i>
                        </button>
                        <button class="btn" 
                                [ngClass]="subtask.status === 'IN_PROGRESS' ? 'btn-primary' : 'btn-outline-primary'"
                                (click)="updateSubTaskStatus(subtask.id, 'IN_PROGRESS')"
                                [disabled]="subtask.status === 'IN_PROGRESS'"
                                title="Mark as In Progress">
                          <i class="feather icon-play"></i>
                        </button>
                        <button class="btn" 
                                [ngClass]="subtask.status === 'DONE' ? 'btn-success' : 'btn-outline-success'"
                                (click)="updateSubTaskStatus(subtask.id, 'DONE')"
                                [disabled]="subtask.status === 'DONE'"
                                title="Mark as Done">
                          <i class="feather icon-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="assignedSubTasks.length === 0">
                    <td colspan="7" class="text-center py-4">
                      <i class="feather icon-user-x text-muted" style="font-size: 48px;"></i>
                      <p class="text-muted mt-2 mb-0">No sub-tasks assigned to you</p>
                    </td>
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
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="feather icon-edit me-2"></i>
              Edit Personal Task
            </h5>
            <button type="button" class="btn-close" (click)="cancelTaskEdit()"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="feather icon-edit-3 me-1"></i>
                    Title
                  </label>
                  <input type="text" class="form-control" [(ngModel)]="editingTask.title" placeholder="Enter task title">
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    <i class="feather icon-flag me-1"></i>
                    Priority
                  </label>
                  <select class="form-select" [(ngModel)]="editingTask.priority">
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🔴 High</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    <i class="feather icon-calendar me-1"></i>
                    Due Date
                  </label>
                  <input type="date" class="form-control" [(ngModel)]="editingTask.dueDate">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="feather icon-activity me-1"></i>
                    Status
                  </label>
                  <select class="form-select" [(ngModel)]="editingTask.status">
                    <option value="NOT_STARTED">⏸️ Not Started</option>
                    <option value="IN_PROGRESS">▶️ In Progress</option>
                    <option value="DONE">✅ Done</option>
                  </select>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="form-label">
                    <i class="feather icon-file-text me-1"></i>
                    Description
                  </label>
                  <textarea class="form-control" rows="4" [(ngModel)]="editingTask.description" placeholder="Enter task description"></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelTaskEdit()">
              <i class="feather icon-x me-1"></i>
              Cancel
            </button>
            <button type="button" class="btn btn-primary" (click)="updatePersonalTask()">
              <i class="feather icon-save me-1"></i>
              Update Task
            </button>
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
    /* Component Specific Styles */
    .container-fluid {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    /* Navigation Styles */
    .navbar {
      background: linear-gradient(45deg, #263238, #37474f) !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem 0;
    }
    
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    /* Tab Navigation */
    .nav-tabs {
      background: transparent;
      border: none;
    }
    
    .nav-tabs .nav-link {
      border: none;
      color: #748892;
      font-weight: 500;
      padding: 1rem 1.5rem;
      margin-right: 0.5rem;
      border-radius: 8px 8px 0 0;
      transition: all 0.3s ease;
      background: transparent;
    }
    
    .nav-tabs .nav-link:hover {
      color: #4099ff;
      background: rgba(64, 153, 255, 0.05);
      border: none;
    }
    
    .nav-tabs .nav-link.active {
      background: #4099ff;
      color: white !important;
      border: none;
      font-weight: 600;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(64, 153, 255, 0.3);
    }
    
    /* Order Cards */
    .order-card {
      border: none;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .order-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .order-card::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    .order-card .card-body {
      padding: 2rem;
      position: relative;
      z-index: 1;
    }
    
    .order-card h6 {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-bottom: 1rem;
    }
    
    .order-card h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .order-card i {
      font-size: 2rem;
      opacity: 0.7;
    }
    
    /* Cards */
    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      margin-bottom: 2rem;
    }
    
    .card:hover {
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .card-header {
      background: transparent;
      border-bottom: 1px solid #e3eaef;
      padding: 1.5rem 2rem;
      border-radius: 12px 12px 0 0;
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .card-footer {
      background: #f8f9fa;
      border-top: 1px solid #e3eaef;
      padding: 1rem 2rem;
      border-radius: 0 0 12px 12px;
    }
    
    /* Tables */
    .table {
      margin-bottom: 0;
    }
    
    .table th {
      background: #f8f9fa;
      border-bottom: 2px solid #e3eaef;
      font-weight: 600;
      color: #263238;
      padding: 1rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .table td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid #f1f3f4;
      vertical-align: middle;
    }
    
    .table-hover tbody tr:hover {
      background-color: rgba(64, 153, 255, 0.03);
    }
    
    /* Buttons */
    .btn {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
    }
    
    .btn:hover {
      transform: translateY(-1px);
    }
    
    .btn-group-sm .btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    
    /* Badges */
    .badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
    }
    
    /* Forms */
    .form-control, .form-select {
      border: 1px solid #e3eaef;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      transition: all 0.3s ease;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: #4099ff;
      box-shadow: 0 0 0 0.2rem rgba(64, 153, 255, 0.15);
    }
    
    .form-label {
      font-weight: 600;
      color: #263238;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
    }
    
    /* Modal */
    .modal-content {
      border: none;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    
    .modal-header {
      background: #f8f9fa;
      border-bottom: 1px solid #e3eaef;
      border-radius: 12px 12px 0 0;
      padding: 1.5rem 2rem;
    }
    
    .modal-body {
      padding: 2rem;
    }
    
    .modal-footer {
      border-top: 1px solid #e3eaef;
      padding: 1.5rem 2rem;
      border-radius: 0 0 12px 12px;
    }
    
    /* Animations */
    .fade-in-up {
      animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container-fluid {
        padding: 0 1rem;
      }
      
      .card-body {
        padding: 1.5rem;
      }
      
      .card-header {
        padding: 1rem 1.5rem;
      }
      
      .order-card .card-body {
        padding: 1.5rem;
      }
      
      .nav-tabs .nav-link {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
      }
    }
    
    /* Feather Icons */
    .feather {
      width: 16px;
      height: 16px;
      vertical-align: middle;
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