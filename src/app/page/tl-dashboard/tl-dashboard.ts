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
    <!-- Top Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top">
      <div class="container-fluid">
        <button class="btn btn-light d-lg-none me-2" (click)="toggleSidebar()">
          <span class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <span class="navbar-brand text-primary fw-bold mb-0">ePS Task Hub</span>
        <div class="ms-auto d-flex align-items-center">
          <span class="navbar-text me-3 text-dark d-none d-lg-block">
            Welcome, <span class="fw-bold">{{ currentUser }}!</span>
          </span>
          <button class="btn btn-primary btn-sm d-none d-lg-block" (click)="logout()">
            <i class="fas fa-sign-out-alt me-1"></i>Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <div class="sidebar" [class.show]="sidebarOpen">
      <div class="sidebar-header d-lg-none">
        <div class="d-flex justify-content-between align-items-center w-100">
          <span class="text-dark fw-bold">Welcome, {{ currentUser }}!</span>
          <button class="btn btn-link text-muted" (click)="toggleSidebar()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <ul class="sidebar-nav">
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'overview'"
            (click)="setActiveTab('overview')"
          >
            <i class="far fa-chart-bar me-2"></i>Overview
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'assigned-subtasks'"
            (click)="setActiveTab('assigned-subtasks')"
          >
            <i class="far fa-list-alt me-2"></i>Assigned Sub-Tasks
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'my-subtasks'"
            (click)="setActiveTab('my-subtasks')"
          >
            <i class="far fa-user me-2"></i>My Sub-Tasks
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'create-subtask'"
            (click)="setActiveTab('create-subtask')"
          >
            <i class="far fa-edit me-2"></i>Create Sub-Task
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'personal'"
            (click)="setActiveTab('personal')"
          >
            <i class="far fa-clipboard me-2"></i>Personal Tasks
          </button>
        </li>
      </ul>
      <div class="sidebar-footer d-lg-none">
        <button class="sidebar-link logout-btn" (click)="logout()">
          <i class="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </div>
    </div>

    <!-- Sidebar Overlay for Mobile -->
    <div class="sidebar-overlay" [class.show]="sidebarOpen" (click)="toggleSidebar()"></div>

    <!-- Main Content -->
    <div class="main-content">

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content">
        <!-- Project Filter -->
        <div class="row mb-3">
          <div class="col-md-4">
            <select class="form-select" [(ngModel)]="selectedProjectId" (change)="onProjectFilterChange()">
              <option value="">All Projects</option>
              <option *ngFor="let project of tlProjects" [value]="project.id">{{project.name}}</option>
            </select>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <i class="fas fa-project-diagram text-primary fs-1 mb-2"></i>
                <h5 class="text-primary">{{ selectedProjectId ? 'Current Project' : 'My Projects' }}</h5>
                <h2 class="text-dark">{{ selectedProjectId ? '1' : tlProjects.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <i class="fas fa-tasks text-info fs-1 mb-2"></i>
                <h5 class="text-info">Sub-Tasks</h5>
                <h2 class="text-dark">{{ getFilteredSubTasks().length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <i class="fas fa-check-circle text-success fs-1 mb-2"></i>
                <h5 class="text-success">Completed</h5>
                <h2 class="text-dark">{{ getCompletedSubTasksCount() }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <i class="fas fa-clock text-warning fs-1 mb-2"></i>
                <h5 class="text-warning">Completion Rate</h5>
                <h2 class="text-dark">{{ getTeamCompletionPercentage() }}%</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div class="row">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">My Projects</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let project of tlProjects" class="mb-3 p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="text-primary">{{project.name}}</h6>
                      <p class="text-muted mb-1 small">{{project.description}}</p>
                      <small class="text-secondary">Due: {{project.dueDate | date}} | Manager: {{project.managerUsername}}</small>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-info">{{ getProjectSubTasksCount(project.id) }} tasks</span>
                    </div>
                  </div>
                </div>
                <div *ngIf="tlProjects.length === 0" class="text-muted text-center py-3">
                  <i class="fas fa-folder-open fs-1 text-muted mb-2"></i>
                  <p>No projects assigned</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">{{ selectedProjectId ? 'Project Team Performance' : 'Overall Performance' }}</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Not Started</span>
                    <span class="badge bg-secondary">{{ getNotStartedCount() }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">In Progress</span>
                    <span class="badge bg-primary">{{ getInProgressSubTasksCount() }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Completed</span>
                    <span class="badge bg-success">{{ getCompletedSubTasksCount() }}</span>
                  </div>
                </div>
                <div class="mb-3" *ngIf="!selectedProjectId">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Personal Tasks</span>
                    <span class="badge bg-info">{{ personalTasks.length }}</span>
                  </div>
                </div>
                <div class="mb-3" *ngIf="!selectedProjectId">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Created Sub-Tasks</span>
                    <span class="badge bg-warning">{{ createdSubTasks.length }}</span>
                  </div>
                </div>
                <div *ngIf="selectedProjectId && getTeamMembers().length > 0">
                  <h6 class="text-muted mb-2">Team Members:</h6>
                  <div *ngFor="let member of getTeamMembers()" class="mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-dark">{{ member.name }}</small>
                      <div>
                        <span class="badge bg-light text-dark me-1">{{ member.assignedTasks }} tasks</span>
                        <span class="badge" [ngClass]="{
                          'bg-success': member.completionRate >= 80,
                          'bg-warning': member.completionRate >= 50 && member.completionRate < 80,
                          'bg-danger': member.completionRate < 50
                        }">{{ member.completionRate }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Deadlines -->
        <div class="row mt-4" *ngIf="getUpcomingDeadlines().length > 0">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Upcoming Deadlines</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4" *ngFor="let task of getUpcomingDeadlines()">
                    <div class="card border-warning mb-3">
                      <div class="card-body">
                        <h6 class="text-warning">{{ task.name }}</h6>
                        <p class="text-muted small mb-1">{{ task.projectName }}</p>
                        <p class="text-muted small mb-1">Assigned to: {{ task.memberUsername }}</p>
                        <small class="text-danger">Due: {{ task.dueDate | date }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'assigned-subtasks'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0 text-dark">Project Sub-Tasks</h5>
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
                  <option *ngFor="let project of tlProjects" [value]="project.id">{{project.name}}</option>
                </select>
              </div>
            </div>
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
                  <tr *ngFor="let subtask of getFilteredTLSubTasks()">
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
                        <button class="btn btn-secondary" 
                                (click)="updateSubTaskStatus(subtask.id, 'NOT_STARTED')"
                                [disabled]="subtask.status === 'NOT_STARTED'">
                          Not Started
                        </button>
                        <button class="btn btn-primary" 
                                (click)="updateSubTaskStatus(subtask.id, 'IN_PROGRESS')"
                                [disabled]="subtask.status === 'IN_PROGRESS'">
                          In Progress
                        </button>
                        <button class="btn btn-success" 
                                (click)="updateSubTaskStatus(subtask.id, 'DONE')"
                                [disabled]="subtask.status === 'DONE'">
                          Done
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="getFilteredTLSubTasks().length === 0">
                    <td colspan="7" class="text-center text-muted">No sub-tasks found for selected project</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="assignedSubTasks.length > 0" class="pagination">
              <button class="btn" 
                      [disabled]="assignedSubTasksPage === 0"
                      (click)="changeAssignedSubTasksPage(assignedSubTasksPage - 1)">
                Previous
              </button>
              <span class="page-info">
                Page {{assignedSubTasksPage + 1}} of {{assignedSubTasksTotalPages}}
                ({{assignedSubTasks.length}} total)
              </span>
              <button class="btn"
                      [disabled]="assignedSubTasksPage >= assignedSubTasksTotalPages - 1"
                      (click)="changeAssignedSubTasksPage(assignedSubTasksPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- My Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'my-subtasks'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0 text-dark">Sub-Tasks Created by Me</h5>
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
                  <tr *ngFor="let subtask of createdSubTasks">
                    <td><strong>{{subtask.name}}</strong></td>
                    <td><small>{{subtask.description || 'No description'}}</small></td>
                    <td>{{subtask.memberUsername}}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-secondary': subtask.status === 'NOT_STARTED',
                        'bg-primary': subtask.status === 'IN_PROGRESS',
                        'bg-success': subtask.status === 'DONE'
                      }">{{subtask.status}}</span>
                    </td>
                    <td>{{subtask.dueDate | date}}</td>
                    <td><small>{{subtask.projectName}}</small></td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary" (click)="editSubTask(subtask)">Edit</button>
                        <button class="btn btn-danger" (click)="deleteSubTask(subtask.id)">Delete</button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="createdSubTasks.length === 0">
                    <td colspan="7" class="text-center text-muted">No sub-tasks created by you</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="createdSubTasks.length > 0" class="pagination">
              <button class="btn" 
                      [disabled]="createdSubTasksPage === 0"
                      (click)="changeCreatedSubTasksPage(createdSubTasksPage - 1)">
                Previous
              </button>
              <span class="page-info">
                Page {{createdSubTasksPage + 1}} of {{createdSubTasksTotalPages}}
                ({{createdSubTasks.length}} total)
              </span>
              <button class="btn"
                      [disabled]="createdSubTasksPage >= createdSubTasksTotalPages - 1"
                      (click)="changeCreatedSubTasksPage(createdSubTasksPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Sub-Task Tab -->
      <div *ngIf="activeTab === 'create-subtask'" class="tab-content">
        <div class="row">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
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
                    <input type="date" class="form-control" [(ngModel)]="subTaskObj.dueDate" name="dueDate" [min]="getTomorrowDate()" [max]="getProjectDueDate()" required>
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
                  <button type="submit" class="btn btn-primary w-100">Create Sub-Task</button>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Instructions</h5>
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
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
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
                  <button type="submit" class="btn btn-primary w-100">Add Personal Task</button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-7">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">My Personal Tasks</h5>
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
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary" (click)="editPersonalTask(task)">Edit</button>
                            <button class="btn btn-danger" (click)="deletePersonalTask(task.id)">Delete</button>
                          </div>
                        </td>
                      </tr>
                      <tr *ngIf="getFilteredPersonalTasks().length === 0">
                        <td colspan="5" class="text-center text-muted">No personal tasks found</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div *ngIf="personalTasks.length > 0" class="pagination">
                  <button class="btn" 
                          [disabled]="personalTasksPage === 0"
                          (click)="changePersonalTasksPage(personalTasksPage - 1)">
                    Previous
                  </button>
                  <span class="page-info">
                    Page {{personalTasksPage + 1}} of {{personalTasksTotalPages}}
                    ({{personalTasks.length}} total)
                  </span>
                  <button class="btn"
                          [disabled]="personalTasksPage >= personalTasksTotalPages - 1"
                          (click)="changePersonalTasksPage(personalTasksPage + 1)">
                    Next
                  </button>
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

    <!-- Edit Sub-Task Modal -->
    <div class="modal fade" [class.show]="editingSubTask" [style.display]="editingSubTask ? 'block' : 'none'" 
         *ngIf="editingSubTask" tabindex="-1" (keydown.escape)="cancelSubTaskEdit()" (click)="onSubTaskModalBackdropClick($event)">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Sub-Task</h5>
            <button type="button" class="btn-close" (click)="cancelSubTaskEdit()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" [(ngModel)]="editingSubTask.name">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" rows="3" [(ngModel)]="editingSubTask.description"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Due Date</label>
              <input type="date" class="form-control" [(ngModel)]="editingSubTask.dueDate">
            </div>
            <div class="mb-3">
              <label class="form-label">Assign To</label>
              <select class="form-select" [(ngModel)]="editingSubTask.assigneeUsername">
                <option value="">Select Assignee</option>
                <option *ngFor="let member of editProjectMembers" [value]="member.username">
                  {{member.name}} ({{member.username}}) - {{member.role}}
                </option>
              </select>
              <small class="text-muted" *ngIf="editProjectMembers.length === 0">Loading project members...</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelSubTaskEdit()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="updateSubTask()">Update Sub-Task</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" [class.show]="editingSubTask" *ngIf="editingSubTask"></div>
  `,
  styles: [`
    .navbar {
      z-index: 1030;
      height: 60px;
    }
    
    .sidebar {
      position: fixed;
      top: 0;
      left: -250px;
      width: 250px;
      height: 100vh;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      transition: left 0.3s ease;
      z-index: 1020;
      overflow-y: auto;
    }
    
    .sidebar.show {
      left: 0;
    }
    
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      margin-top: 60px;
      background: white;
    }
    
    .sidebar-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 1px solid #dee2e6;
      background: white;
    }
    
    .logout-btn {
      color: #dc3545 !important;
    }
    
    .logout-btn:hover {
      background: #f8d7da !important;
      color: #721c24 !important;
    }
    
    .sidebar-nav {
      list-style: none;
      padding: 0.5rem 0 0 0;
      margin: 0;
    }
    
    @media (min-width: 992px) {
      .sidebar-nav {
        padding: 3.5rem 0 0 0;
      }
    }
    
    .sidebar-link {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      color: #495057;
      text-decoration: none;
      border: none;
      background: none;
      text-align: left;
      transition: all 0.3s ease;
    }
    
    .sidebar-link:hover {
      background: #e9ecef;
      color: #2563eb;
    }
    
    .sidebar-link.active {
      background: #e3f2fd;
      color: #2563eb;
      border-left: 3px solid #2563eb;
    }
    
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1010;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .sidebar-overlay.show {
      opacity: 1;
      visibility: visible;
    }
    
    .main-content {
      margin-top: 60px;
      padding: 2rem;
      transition: margin-left 0.3s ease;
    }
    
    @media (min-width: 992px) {
      .sidebar {
        left: 0;
        box-shadow: none;
      }
      
      .main-content {
        margin-left: 250px;
      }
      
      .sidebar-overlay {
        display: none;
      }
      
      .sidebar-header {
        display: none !important;
      }
      
      .sidebar-footer {
        display: none !important;
      }
    }
    
    @media (max-width: 991.98px) {
      .main-content {
        padding: 1rem;
      }
    }
    
    .card {
      border-radius: 10px;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .table th {
      border-top: none;
      font-weight: 600;
      background-color: #f8f9fa;
    }
    
    .toast.show { display: block; }
    .toast { display: none; }
    .tab-content { min-height: 400px; }
    
    .btn-group-sm .btn {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
    
    .pagination {
      margin-top: 1rem;
    }
    
    .page-link {
      color: #2563eb;
      border: 1px solid #dee2e6;
    }
    
    .page-item.active .page-link {
      background-color: #2563eb;
      border-color: #2563eb;
      color: white !important;
    }
    
    .btn-outline-primary {
      color: #2563eb !important;
      border-color: #2563eb !important;
    }
    
    .hamburger-icon {
      display: inline-block;
      width: 18px;
      height: 14px;
      position: relative;
    }
    
    .hamburger-icon span {
      display: block;
      height: 2px;
      width: 100%;
      background: #2563eb;
      margin: 3px 0;
      transition: 0.3s;
    }
    
    .fs-1 {
      font-size: 2.5rem;
    }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
    }
    
    .pagination .btn {
      background: #6c757d;
      border-color: #dee2e6;
      color: white;
    }
    
    .pagination .btn:hover:not(:disabled) {
      background: #5a6268;
      border-color: #adb5bd;
    }
    
    .page-info {
      color: #6c757d;
      font-size: 0.875rem;
      font-weight: 500;
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
  createdSubTasks: any[] = [];
  personalTasks: any[] = [];
  allUsers: any[] = [];
  projectMembers: any[] = [];
  editProjectMembers: any[] = [];
  tlProjects: any[] = [];
  selectedProjectId: string | null = '';
  editingTask: any = null;
  editingSubTask: any = null;
  
  // Pagination
  assignedSubTasksPage = 0;
  assignedSubTasksSize = 10;
  assignedSubTasksTotalPages = 0;
  createdSubTasksPage = 0;
  createdSubTasksSize = 10;
  createdSubTasksTotalPages = 0;
  personalTasksPage = 0;
  personalTasksSize = 5;
  personalTasksTotalPages = 0;
  
  // Form objects
  personalTaskObj: Task = new Task();
  subTaskObj: SubTask = new SubTask();
  
  // UI state
  showToast = false;
  toastMessage = '';
  toastError = false;
  sidebarOpen = false;
  subTaskStatusFilter: string = '';
  subTaskDueDateFilter: string = '';
  subTaskProjectFilter: string = '';
  taskPriorityFilter: string = '';
  taskStatusFilter: string = '';
  taskDueDateFilter: string = '';

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Team Lead';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadAssignedSubTasks();
    this.loadCreatedSubTasks();
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

  getProjectDueDate(): string {
    if (!this.subTaskObj.projectId) return '';
    const project = this.tlProjects.find(p => p.id === this.subTaskObj.projectId);
    return project ? project.dueDate : '';
  }

  getAvailableProjects(): any[] {
    return this.tlProjects;
  }

  loadAssignedSubTasks(): void {
    this.subTaskService.getSubTasksByTL(this.assignedSubTasksPage, this.assignedSubTasksSize).subscribe({
      next: (response) => {
        this.assignedSubTasks = response.content || [];
        this.assignedSubTasksTotalPages = Math.max(1, response.totalPages || 0);
      },
      error: (error) => {
        console.error('Error loading assigned sub-tasks:', error);
        this.assignedSubTasks = [];
      }
    });
  }

  loadCreatedSubTasks(): void {
    this.subTaskService.getSubTasksCreatedByTL(this.createdSubTasksPage, this.createdSubTasksSize).subscribe({
      next: (response) => {
        this.createdSubTasks = response.content || [];
        this.createdSubTasksTotalPages = Math.max(1, response.totalPages || 0);
      },
      error: (error) => {
        console.error('Error loading created sub-tasks:', error);
        this.createdSubTasks = [];
      }
    });
  }

  loadPersonalTasks(): void {
    this.todoService.getAllTasks(this.personalTasksPage, this.personalTasksSize).subscribe({
      next: (response: any) => {
        this.personalTasks = response.content || [];
        this.personalTasksTotalPages = Math.max(1, response.totalPages || 0);
      },
      error: (error) => {
        console.error('Error loading personal tasks:', error);
        this.personalTasks = [];
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
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
        this.loadCreatedSubTasks();
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
        this.personalTasksPage = 0; // Reset to first page
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

  getFilteredTLSubTasks(): any[] {
    return this.assignedSubTasks.filter(subtask => {
      const statusMatch = !this.subTaskStatusFilter || subtask.status === this.subTaskStatusFilter;
      const dueDateMatch = !this.subTaskDueDateFilter || subtask.dueDate?.split('T')[0] === this.subTaskDueDateFilter;
      const projectMatch = !this.subTaskProjectFilter || subtask.projectId === Number(this.subTaskProjectFilter);
      return statusMatch && dueDateMatch && projectMatch;
    });
  }

  cancelTaskEdit(): void {
    this.editingTask = null;
  }

  onProjectFilterChange(): void {
    // Filter is handled by getFilteredSubTasks() method
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
    if (!this.selectedProjectId || this.selectedProjectId === '' || this.selectedProjectId === null) {
      return this.assignedSubTasks;
    }
    return this.assignedSubTasks.filter(task => task.projectId === Number(this.selectedProjectId));
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

  getProjectSubTasksCount(projectId: number): number {
    return this.assignedSubTasks.filter(task => task.projectId === projectId).length;
  }

  getSelectedProjectName(): string {
    if (!this.selectedProjectId) return '';
    const project = this.tlProjects.find(p => p.id === Number(this.selectedProjectId));
    return project ? project.name : '';
  }

  getSelectedProjectManager(): string {
    if (!this.selectedProjectId) return '';
    const project = this.tlProjects.find(p => p.id === Number(this.selectedProjectId));
    return project ? project.managerUsername : '';
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

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  editSubTask(subtask: any): void {
    this.editingSubTask = { ...subtask };
    if (this.editingSubTask.dueDate) {
      this.editingSubTask.dueDate = this.editingSubTask.dueDate.split('T')[0];
    }
    // Set the assignee username from memberUsername field
    this.editingSubTask.assigneeUsername = subtask.memberUsername;
    // Clear previous members and load project members for the sub-task's project
    this.editProjectMembers = [];
    this.loadEditProjectMembers(subtask.projectId);
  }

  loadEditProjectMembers(projectId: number): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.editProjectMembers = members;
      },
      error: (error) => {
        console.error('Error loading project members for edit:', error);
        this.editProjectMembers = [];
      }
    });
  }

  updateSubTask(): void {
    if (!this.editingSubTask) return;
    
    const updateData = {
      name: this.editingSubTask.name,
      description: this.editingSubTask.description,
      dueDate: this.editingSubTask.dueDate,
      projectId: this.editingSubTask.projectId,
      assigneeUsername: this.editingSubTask.assigneeUsername
    };

    this.subTaskService.updateSubTask(this.editingSubTask.id, updateData).subscribe({
      next: (updated) => {
        this.showToastMessage('Sub-task updated successfully!');
        this.editingSubTask = null;
        this.loadCreatedSubTasks();
      },
      error: (error) => {
        this.showToastMessage('Error updating sub-task', true);
      }
    });
  }

  deleteSubTask(subtaskId: number): void {
    if (confirm('Are you sure you want to delete this sub-task?')) {
      this.subTaskService.deleteSubTask(subtaskId).subscribe({
        next: () => {
          this.showToastMessage('Sub-task deleted successfully!');
          this.loadCreatedSubTasks();
        },
        error: (error) => {
          this.showToastMessage('Error deleting sub-task', true);
        }
      });
    }
  }

  cancelSubTaskEdit(): void {
    this.editingSubTask = null;
  }

  onSubTaskModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelSubTaskEdit();
    }
  }

  // Pagination methods
  changeAssignedSubTasksPage(page: number): void {
    if (page >= 0 && page < this.assignedSubTasksTotalPages) {
      this.assignedSubTasksPage = page;
      this.loadAssignedSubTasks();
    }
  }

  changeCreatedSubTasksPage(page: number): void {
    if (page >= 0 && page < this.createdSubTasksTotalPages) {
      this.createdSubTasksPage = page;
      this.loadCreatedSubTasks();
    }
  }

  changePersonalTasksPage(page: number): void {
    if (page >= 0 && page < this.personalTasksTotalPages) {
      this.personalTasksPage = page;
      this.loadPersonalTasks();
    }
  }

  getPageNumbers(totalPages: number): number[] {
    const pages = Math.max(1, totalPages); // Always show at least 1 page
    return Array.from({length: Math.min(5, pages)}, (_, i) => i);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}