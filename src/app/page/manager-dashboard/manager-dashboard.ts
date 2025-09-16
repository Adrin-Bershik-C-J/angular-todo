import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { ProjectService } from '../../service/project';
import { SubTaskService } from '../../service/subtask';
import { TodoService } from '../../service/todo';
import {
  ProjectRequestModel,
  ProjectResponseModel,
} from '../../model/project.model';
import { SubTask } from '../../model/subtask.model';
import { Task } from '../../model/todo.model';

@Component({
  selector: 'app-manager-dashboard',
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
          <button class="btn btn-danger btn-sm d-none d-lg-block" (click)="logout()">
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
            [class.active]="activeTab === 'projects'"
            (click)="setActiveTab('projects')"
          >
            <i class="far fa-plus-square me-2"></i>Create Project
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'subtasks'"
            (click)="setActiveTab('subtasks')"
          >
            <i class="far fa-edit me-2"></i>Create Sub-Task
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'project-subtasks'"
            (click)="setActiveTab('project-subtasks')"
          >
            <i class="far fa-list-alt me-2"></i>Project Sub-Tasks
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'create-personal'"
            (click)="setActiveTab('create-personal')"
          >
            <i class="far fa-plus-square me-2"></i>Create Personal Task
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'my-personal'"
            (click)="setActiveTab('my-personal')"
          >
            <i class="far fa-clipboard me-2"></i>My Personal Tasks
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
              <option *ngFor="let project of projects" [value]="project.id">{{project.name}}</option>
            </select>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card border-primary overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-project-diagram text-primary fs-1 mb-2"></i>
                <h5 class="text-primary">{{ selectedProjectId ? 'Current Project' : 'My Projects' }}</h5>
                <h2 class="text-dark">{{ selectedProjectId ? '1' : projects.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-success overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-users text-success fs-1 mb-2"></i>
                <h5 class="text-success">Team Members</h5>
                <h2 class="text-dark">{{ getFilteredTeamMembers() }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-info overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-tasks text-info fs-1 mb-2"></i>
                <h5 class="text-info">Sub-Tasks</h5>
                <h2 class="text-dark">{{ getFilteredSubTasksCount() }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-warning overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-chart-line text-warning fs-1 mb-2"></i>
                <h5 class="text-warning">Completion Rate</h5>
                <h2 class="text-dark">{{ getProjectCompletionRate() }}%</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div class="row">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">{{ selectedProjectId ? 'Project Details' : 'My Projects' }}</h5>
              </div>
              <div class="card-body" style="height: 250px; overflow-y: auto;">
                <div
                  *ngFor="let project of getFilteredProjects()"
                  class="mb-3 p-3 border rounded"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="text-primary">{{ project.name }}</h6>
                      <p class="text-muted mb-1 small">{{ project.description }}</p>
                      <small class="text-secondary">Due: {{ project.dueDate | date }} | TL: {{ project.tlUsername }}</small>
                      <div class="mt-2">
                        <span class="badge bg-info me-1">{{ getProjectSubTasksCount(project.id) }} tasks</span>
                        <span class="badge bg-secondary">{{ project.memberUsernames.length }} members</span>
                      </div>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-primary"
                        (click)="editProject(project)"
                        title="Edit"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="btn btn-danger"
                        (click)="deleteProject(project.id)"
                        title="Delete"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div *ngIf="getFilteredProjects().length === 0" class="text-muted text-center py-3">
                  <i class="fas fa-folder-open fs-1 text-muted mb-2"></i>
                  <p>No projects found</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">{{ selectedProjectId ? 'Project Performance' : 'Overall Performance' }}</h5>
              </div>
              <div class="card-body" style="height: 250px; overflow-y: auto;">
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Not Started</span>
                    <span class="badge bg-secondary">{{ getNotStartedSubTasksCount() }}</span>
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
                <div *ngIf="selectedProjectId && getProjectTeamMembers().length > 0">
                  <h6 class="text-muted mb-2">Team Members:</h6>
                  <div *ngFor="let member of getProjectTeamMembers()" class="mb-2">
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
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="projectObj.name"
                      name="name"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      rows="3"
                      [(ngModel)]="projectObj.description"
                      name="description"
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Due Date</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="projectObj.dueDate"
                      name="dueDate"
                      [min]="getTodayDate()"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Team Lead</label>
                    <select
                      class="form-select"
                      [(ngModel)]="selectedTlUsername"
                      name="tlUsername"
                      required
                    >
                      <option value="">Select Team Lead</option>
                      <option
                        *ngFor="let tl of getTLUsers()"
                        [value]="tl.username"
                      >
                        {{ tl.name }} ({{ tl.username }})
                      </option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Team Members</label>
                    <div
                      class="border rounded p-2"
                      style="max-height: 200px; overflow-y: auto;"
                    >
                      <div class="row g-2">
                        <div
                          *ngFor="let member of getMemberUsers()"
                          class="col-12"
                        >
                          <div
                            class="card"
                            [class.border-primary]="
                              selectedMemberUsernames.includes(member.username)
                            "
                            [class.bg-primary]="
                              selectedMemberUsernames.includes(member.username)
                            "
                            [class.text-white]="
                              selectedMemberUsernames.includes(member.username)
                            "
                            style="cursor: pointer; transition: all 0.2s;"
                            (click)="toggleMemberSelection(member.username)"
                          >
                            <div
                              class="card-body p-2 d-flex align-items-center"
                            >
                              <div class="flex-grow-1">
                                <div class="fw-semibold">{{ member.name }}</div>
                                <small
                                  [class.text-white-50]="
                                    selectedMemberUsernames.includes(
                                      member.username
                                    )
                                  "
                                  [class.text-muted]="
                                    !selectedMemberUsernames.includes(
                                      member.username
                                    )
                                  "
                                  >@{{ member.username }}</small
                                >
                              </div>
                              <i
                                class="fas fa-user-circle fs-5"
                                [class.text-white]="
                                  selectedMemberUsernames.includes(
                                    member.username
                                  )
                                "
                                [class.text-primary]="
                                  !selectedMemberUsernames.includes(
                                    member.username
                                  )
                                "
                              ></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      *ngIf="getMemberUsers().length === 0"
                      class="text-muted text-center p-3"
                    >
                      No team members available
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    Create Project
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-7">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Project Creation Guide</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <h6>Creating Projects</h6>
                  <ul class="mb-0">
                    <li>Select a Team Lead from available TLs</li>
                    <li>Choose multiple team members for the project</li>
                    <li>Set realistic due dates for project completion</li>
                    <li>
                      Projects can be edited later (except Team Lead assignment)
                    </li>
                  </ul>
                </div>
                <div class="row text-center mb-4">
                  <div class="col-4">
                    <div class="border rounded p-3">
                      <h3 class="text-primary">{{projects.length}}</h3>
                      <small class="text-muted">My Projects</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="border rounded p-3">
                      <h3 class="text-success">{{getTLUsers().length}}</h3>
                      <small class="text-muted">Available TLs</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="border rounded p-3">
                      <h3 class="text-info">{{getMemberUsers().length}}</h3>
                      <small class="text-muted">Available Members</small>
                    </div>
                  </div>
                </div>
                <div class="alert alert-warning">
                  <h6>Project Tips</h6>
                  <ul class="mb-0 small">
                    <li>Assign team leads who can effectively manage team members</li>
                    <li>Balance workload across multiple projects</li>
                    <li>Consider team member availability and skills</li>
                    <li>Set buffer time for unexpected delays</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Sub-Task Tab -->
      <div *ngIf="activeTab === 'subtasks'" class="tab-content">
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
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="subTaskObj.name"
                      name="name"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      rows="3"
                      [(ngModel)]="subTaskObj.description"
                      name="description"
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Due Date</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="subTaskObj.dueDate"
                      name="dueDate"
                      [min]="getTomorrowDate()"
                      [max]="getProjectDueDate()"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Project</label>
                    <select
                      class="form-select"
                      [(ngModel)]="subTaskObj.projectId"
                      name="projectId"
                      (change)="onProjectSelect()"
                      required
                    >
                      <option value="">Select Project</option>
                      <option
                        *ngFor="let project of projects"
                        [value]="project.id"
                      >
                        {{ project.name }}
                      </option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Assign To</label>
                    <select
                      class="form-select"
                      [(ngModel)]="subTaskObj.assigneeUsername"
                      name="assigneeUsername"
                      required
                    >
                      <option value="">Select Assignee</option>
                      <option
                        *ngFor="let member of projectMembers"
                        [value]="member.username"
                      >
                        {{ member.name }} ({{ member.username }}) -
                        {{ member.role }}
                      </option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    Create Sub-Task
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Sub-Task Creation Guide</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <h6>Creating Sub-Tasks</h6>
                  <ul class="mb-0">
                    <li>Select a project you manage</li>
                    <li>Choose team members from the project</li>
                    <li>Set due dates within project timeline</li>
                    <li>Break down complex tasks into manageable pieces</li>
                    <li>Monitor progress in Project Sub-Tasks tab</li>
                  </ul>
                </div>
                <div class="alert alert-warning">
                  <h6>Best Practices</h6>
                  <ul class="mb-0">
                    <li>Keep sub-task names clear and specific</li>
                    <li>Assign realistic deadlines</li>
                    <li>Include detailed descriptions for complex tasks</li>
                    <li>Regularly update task status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'project-subtasks'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0 text-dark">Project Sub-Tasks</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  [(ngModel)]="subTaskStatusFilter"
                  (change)="onSubTaskFilterChange()"
                >
                  <option value="">All Status</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div class="col-md-4">
                <input
                  type="date"
                  class="form-control form-control-sm"
                  [(ngModel)]="subTaskDueDateFilter"
                  (change)="onSubTaskFilterChange()"
                  placeholder="Filter by due date"
                />
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  [(ngModel)]="subTaskProjectFilter"
                  (change)="onSubTaskFilterChange()"
                >
                  <option value="">All Projects</option>
                  <option
                    *ngFor="let project of projects"
                    [value]="project.id"
                  >
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Project</th>
                    <th>Status Actions</th>
                    <th>Edit/Delete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let subtask of getPaginatedSubTasks()">
                    <td>{{ subtask.name }}</td>
                    <td>{{ subtask.memberUsername }}</td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="{
                          'bg-secondary': subtask.status === 'NOT_STARTED',
                          'bg-warning': subtask.status === 'IN_PROGRESS',
                          'bg-primary': subtask.status === 'DONE'
                        }"
                        >{{ subtask.status }}</span
                      >
                    </td>
                    <td>{{ subtask.dueDate | date }}</td>
                    <td>{{ subtask.projectName }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-secondary btn-sm" 
                                (click)="updateSubTaskStatus(subtask.id, 'NOT_STARTED')"
                                [disabled]="subtask.status === 'NOT_STARTED'"
                                title="Not Started">
                          <i class="fas fa-pause"></i>
                        </button>
                        <button class="btn btn-primary btn-sm" 
                                (click)="updateSubTaskStatus(subtask.id, 'IN_PROGRESS')"
                                [disabled]="subtask.status === 'IN_PROGRESS'"
                                title="In Progress">
                          <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-success btn-sm" 
                                (click)="updateSubTaskStatus(subtask.id, 'DONE')"
                                [disabled]="subtask.status === 'DONE'"
                                title="Done">
                          <i class="fas fa-check"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-info"
                          (click)="editSubTask(subtask)"
                          title="Edit"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          class="btn btn-danger"
                          (click)="deleteSubTask(subtask.id)"
                          title="Delete"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="getPaginatedSubTasks().length === 0">
                    <td colspan="7" class="text-center text-muted">
                      No sub-tasks found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="getFilteredSubTasks().length > 0" class="pagination">
              <button class="btn" 
                      [disabled]="subTasksCurrentPage === 0"
                      (click)="changeSubTasksPage(subTasksCurrentPage - 1)">
                Previous
              </button>
              <span class="page-info">
                Page {{subTasksCurrentPage + 1}} of {{getSubTasksTotalPages()}}
              </span>
              <button class="btn"
                      [disabled]="subTasksCurrentPage >= getSubTasksTotalPages() - 1"
                      (click)="changeSubTasksPage(subTasksCurrentPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Personal Task Tab -->
      <div *ngIf="activeTab === 'create-personal'" class="tab-content">
        <div class="row">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Create Personal Task</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createPersonalTask()">
                  <div class="mb-3">
                    <label class="form-label">Title</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="personalTaskObj.title"
                      name="title"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea
                      class="form-control"
                      rows="3"
                      [(ngModel)]="personalTaskObj.description"
                      name="description"
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Priority</label>
                    <select
                      class="form-select"
                      [(ngModel)]="personalTaskObj.priority"
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
                      [(ngModel)]="personalTaskObj.dueDate"
                      name="dueDate"
                      [min]="getTodayDate()"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select
                      class="form-select"
                      [(ngModel)]="personalTaskObj.status"
                      name="status"
                      required
                    >
                      <option>NOT_STARTED</option>
                      <option>IN_PROGRESS</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    Add Personal Task
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Personal Task Statistics</h5>
              </div>
              <div class="card-body">
                <div class="row text-center mb-4">
                  <div class="col-4">
                    <div class="border rounded p-3">
                      <h3 class="text-primary">{{personalTasks.length}}</h3>
                      <small class="text-muted">Total Tasks</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="border rounded p-3">
                      <h3 class="text-success">{{getCompletedPersonalTasksCount()}}</h3>
                      <small class="text-muted">Completed</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="border rounded p-3">
                      <h3 class="text-warning">{{getPendingPersonalTasksCount()}}</h3>
                      <small class="text-muted">Pending</small>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Personal Task Completion Rate</label>
                  <div class="progress mb-2">
                    <div class="progress-bar bg-success" [style.width.%]="getPersonalTaskCompletionRate()"></div>
                  </div>
                  <small class="text-muted">{{getPersonalTaskCompletionRate()}}% of personal tasks completed</small>
                </div>
                <div class="alert alert-info">
                  <h6>Personal Task Tips</h6>
                  <ul class="mb-0 small">
                    <li>Set realistic due dates for better time management</li>
                    <li>Use HIGH priority for urgent personal tasks</li>
                    <li>Break down complex tasks into smaller ones</li>
                    <li>Review and update task status regularly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Personal Tasks Tab -->
      <div *ngIf="activeTab === 'my-personal'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0 text-dark">My Personal Tasks</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  [(ngModel)]="taskPriorityFilter"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  [(ngModel)]="taskStatusFilter"
                >
                  <option value="">All Status</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div class="col-md-4">
                <input
                  type="date"
                  class="form-control form-control-sm"
                  [(ngModel)]="taskDueDateFilter"
                  placeholder="Filter by due date"
                />
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
                    <td>{{ task.title }}</td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="{
                          'bg-success': task.priority === 'LOW',
                          'bg-warning': task.priority === 'MEDIUM',
                          'bg-danger': task.priority === 'HIGH'
                        }"
                        >{{ task.priority }}</span
                      >
                    </td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="{
                          'bg-secondary': task.status === 'NOT_STARTED',
                          'bg-warning': task.status === 'IN_PROGRESS',
                          'bg-primary': task.status === 'DONE'
                        }"
                        >{{ task.status }}</span
                      >
                    </td>
                    <td>{{ task.dueDate | date }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-primary"
                          (click)="editPersonalTask(task)"
                          title="Edit"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          class="btn btn-danger"
                          (click)="deletePersonalTask(task.id)"
                          title="Delete"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="getFilteredPersonalTasks().length === 0">
                    <td colspan="5" class="text-center text-muted">
                      No personal tasks found
                    </td>
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

    <!-- Edit Project Modal -->
    <div
      class="modal fade"
      [class.show]="editingProject"
      [style.display]="editingProject ? 'block' : 'none'"
      *ngIf="editingProject"
      tabindex="-1"
      (keydown.escape)="cancelEdit()"
      (click)="onModalBackdropClick($event)"
    >
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Project</h5>
            <button
              type="button"
              class="btn-close"
              (click)="cancelEdit()"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Project Name</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="editingProject.name"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea
                class="form-control"
                rows="3"
                [(ngModel)]="editingProject.description"
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Due Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="editingProject.dueDate"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="cancelEdit()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="updateProject()"
            >
              Update Project
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="editingProject"
      *ngIf="editingProject"
    ></div>

    <!-- Edit Task Modal -->
    <div
      class="modal fade"
      [class.show]="editingTask"
      [style.display]="editingTask ? 'block' : 'none'"
      *ngIf="editingTask"
      tabindex="-1"
      (keydown.escape)="cancelTaskEdit()"
      (click)="onTaskModalBackdropClick($event)"
    >
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Personal Task</h5>
            <button
              type="button"
              class="btn-close"
              (click)="cancelTaskEdit()"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="editingTask.title"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea
                class="form-control"
                rows="3"
                [(ngModel)]="editingTask.description"
              ></textarea>
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
              <input
                type="date"
                class="form-control"
                [(ngModel)]="editingTask.dueDate"
              />
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
            <button
              type="button"
              class="btn btn-secondary"
              (click)="cancelTaskEdit()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="updatePersonalTask()"
            >
              Update Task
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="editingTask"
      *ngIf="editingTask"
    ></div>

    <!-- Edit Sub-Task Modal -->
    <div
      class="modal fade"
      [class.show]="editingSubTask"
      [style.display]="editingSubTask ? 'block' : 'none'"
      *ngIf="editingSubTask"
      tabindex="-1"
      (keydown.escape)="cancelSubTaskEdit()"
      (click)="onSubTaskModalBackdropClick($event)"
    >
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Sub-Task</h5>
            <button
              type="button"
              class="btn-close"
              (click)="cancelSubTaskEdit()"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="editingSubTask.name"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea
                class="form-control"
                rows="3"
                [(ngModel)]="editingSubTask.description"
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Due Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="editingSubTask.dueDate"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Assign To</label>
              <select
                class="form-select"
                [(ngModel)]="editingSubTask.assigneeUsername"
              >
                <option
                  *ngFor="let member of editingSubTaskMembers"
                  [value]="member.username"
                >
                  {{ member.name }} ({{ member.username }}) - {{ member.role }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="cancelSubTaskEdit()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="updateSubTask()"
            >
              Update Sub-Task
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="editingSubTask"
      *ngIf="editingSubTask"
    ></div>

    <!-- Toast Messages -->
    <div class="position-fixed bottom-0 end-0 p-3">
      <div
        class="toast align-items-center border-0"
        [class.text-bg-success]="!toastError"
        [class.text-bg-danger]="toastError"
        [class.show]="showToast"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body">{{ toastMessage }}</div>
          <button
            type="button"
            class="btn-close me-2 m-auto"
            (click)="hideToast()"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
      
      .overview-metric-card {
        border-left: 4px solid #2563eb;
      }
      
      .table th {
        border-top: none;
        font-weight: 600;
        background-color: #f8f9fa;
      }
      
      .toast.show {
        display: block;
      }
      
      .toast {
        display: none;
      }
      
      .tab-content {
        min-height: 400px;
      }
      
      .fs-1 {
        font-size: 2.5rem;
      }
      
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
    `,
  ],
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
  editingSubTask: any = null;
  editingSubTaskMembers: any[] = [];

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
  sidebarOpen = false;
  taskPriorityFilter: string = '';
  taskStatusFilter: string = '';
  taskDueDateFilter: string = '';
  subTaskStatusFilter: string = '';
  subTaskDueDateFilter: string = '';
  subTaskProjectFilter: string = '';
  selectedProjectId: string | null = '';
  subTasksCurrentPage = 0;
  subTasksPageSize = 10;
  
  // Pagination
  managerSubTasksPage = 0;
  managerSubTasksSize = 10;
  managerSubTasksTotalPages = 0;
  personalTasksPage = 0;
  personalTasksSize = 5;
  personalTasksTotalPages = 0;

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
      },
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
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  createProject(): void {
    if (
      !this.projectObj.name ||
      !this.projectObj.dueDate ||
      !this.selectedTlUsername ||
      this.selectedMemberUsernames.length === 0
    ) {
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
        this.showToastMessage(
          'Error creating project: ' + (error.error?.error || 'Unknown error'),
          true
        );
      },
    });
  }

  loadAllUsers(): void {
    this.projectService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  loadProjectMembers(projectId: number): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.projectMembers = members;
      },
      error: (error) => {
        console.error('Error loading project members:', error);
      },
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
      memberUsernames: this.editingProject.memberUsernames,
    };

    this.projectService
      .updateProject(this.editingProject.id, updateData as any)
      .subscribe({
        next: (updated) => {
          this.showToastMessage('Project updated successfully!');
          this.editingProject = null;
          this.loadProjects();
        },
        error: (error) => {
          this.showToastMessage('Error updating project', true);
        },
      });
  }

  cancelEdit(): void {
    this.editingProject = null;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelEdit();
    }
  }

  onTaskModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelTaskEdit();
    }
  }

  getFilteredPersonalTasks(): any[] {
    return this.personalTasks.filter((task) => {
      const priorityMatch =
        !this.taskPriorityFilter || task.priority === this.taskPriorityFilter;
      const statusMatch =
        !this.taskStatusFilter || task.status === this.taskStatusFilter;
      const dueDateMatch =
        !this.taskDueDateFilter ||
        task.dueDate?.split('T')[0] === this.taskDueDateFilter;
      return priorityMatch && statusMatch && dueDateMatch;
    });
  }

  getFilteredSubTasks(): any[] {
    return this.managerSubTasks.filter((subtask) => {
      const statusMatch =
        !this.subTaskStatusFilter ||
        subtask.status === this.subTaskStatusFilter;
      const dueDateMatch =
        !this.subTaskDueDateFilter ||
        subtask.dueDate?.split('T')[0] === this.subTaskDueDateFilter;
      const projectMatch =
        !this.subTaskProjectFilter ||
        subtask.projectId === Number(this.subTaskProjectFilter);
      return statusMatch && dueDateMatch && projectMatch;
    });
  }

  getPaginatedSubTasks(): any[] {
    const filtered = this.getFilteredSubTasks();
    if (filtered.length === 0) return [];
    
    const startIndex = this.subTasksCurrentPage * this.subTasksPageSize;
    const endIndex = startIndex + this.subTasksPageSize;
    const result = filtered.slice(startIndex, endIndex);
    
    return result;
  }

  getSubTasksTotalPages(): number {
    const filtered = this.getFilteredSubTasks();
    if (filtered.length === 0) return 1;
    return Math.ceil(filtered.length / this.subTasksPageSize);
  }

  changeSubTasksPage(page: number): void {
    if (page >= 0 && page < this.getSubTasksTotalPages()) {
      this.subTasksCurrentPage = page;
    }
  }

  createSubTask(): void {
    if (
      !this.subTaskObj.name ||
      !this.subTaskObj.dueDate ||
      !this.subTaskObj.projectId ||
      !this.subTaskObj.assigneeUsername
    ) {
      this.showToastMessage('Please fill all required fields', true);
      return;
    }

    this.subTaskService.createSubTask(this.subTaskObj).subscribe({
      next: (subtask) => {
        this.showToastMessage('Sub-task created successfully!');
        this.resetSubTaskForm();
        this.subTasksCurrentPage = 0;
        this.loadManagerSubTasks();
      },
      error: (error) => {
        this.showToastMessage(
          'Error creating sub-task: ' + (error.error?.error || 'Unknown error'),
          true
        );
      },
    });
  }

  onProjectSelect(): void {
    if (this.subTaskObj.projectId) {
      this.loadProjectMembers(this.subTaskObj.projectId);
    }
  }

  getProjectDueDate(): string {
    if (!this.subTaskObj.projectId) return '';
    const project = this.projects.find(
      (p) => p.id === this.subTaskObj.projectId
    );
    return project ? project.dueDate : '';
  }

  createPersonalTask(): void {
    if (
      !this.personalTaskObj.title ||
      !this.personalTaskObj.priority ||
      !this.personalTaskObj.status
    ) {
      this.showToastMessage('Please fill all required fields', true);
      return;
    }

    this.todoService.createTask(this.personalTaskObj).subscribe({
      next: (task) => {
        this.showToastMessage('Personal task created successfully!');
        this.resetPersonalTaskForm();
        this.personalTasksPage = 0;
        this.loadPersonalTasks();
      },
      error: (error) => {
        this.showToastMessage(
          'Error creating task: ' + (error.error?.error || 'Unknown error'),
          true
        );
      },
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

    this.projectService
      .addMember(this.selectedProject.id, this.newMemberUsername)
      .subscribe({
        next: (updatedProject) => {
          this.showToastMessage('Member added successfully!');
          this.loadProjects();
          this.newMemberUsername = '';
        },
        error: (error) => {
          this.showToastMessage(
            'Error adding member: ' + (error.error?.error || 'Unknown error'),
            true
          );
        },
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

    this.todoService
      .updateTask(this.editingTask.id, this.editingTask)
      .subscribe({
        next: (updated) => {
          this.showToastMessage('Task updated successfully!');
          this.editingTask = null;
          this.loadPersonalTasks();
        },
        error: (error) => {
          this.showToastMessage('Error updating task', true);
        },
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
        },
      });
    }
  }

  loadManagerSubTasks(): void {
    this.subTaskService.getSubTasksByManager(0, 1000).subscribe({
      next: (response) => {
        this.managerSubTasks = response.content || response || [];
      },
      error: (error) => {
        console.error('Error loading manager sub-tasks:', error);
        this.managerSubTasks = [];
      },
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
      },
    });
  }

  // Helper methods
  getActiveSubTasksCount(): number {
    return this.managerSubTasks.filter((task) => task.status !== 'DONE').length;
  }

  getTotalTeamMembers(): number {
    return this.projects.reduce(
      (total, project) => total + project.memberUsernames.length,
      0
    );
  }

  getCompletionPercentage(): number {
    // Mock calculation - in real app, fetch actual sub-task completion data
    return 68;
  }

  // Project filtering methods
  getFilteredProjects(): ProjectResponseModel[] {
    if (!this.selectedProjectId || this.selectedProjectId === '') {
      return this.projects;
    }
    return this.projects.filter(project => project.id === Number(this.selectedProjectId));
  }

  getSelectedProjectName(): string {
    if (!this.selectedProjectId) return '';
    const project = this.projects.find(p => p.id === Number(this.selectedProjectId));
    return project ? project.name : '';
  }

  getSelectedProjectTL(): string {
    if (!this.selectedProjectId) return '';
    const project = this.projects.find(p => p.id === Number(this.selectedProjectId));
    return project ? project.tlUsername : '';
  }

  getSelectedProjectMemberCount(): number {
    if (!this.selectedProjectId) return 0;
    const project = this.projects.find(p => p.id === Number(this.selectedProjectId));
    return project ? project.memberUsernames.length : 0;
  }

  getFilteredTeamMembers(): number {
    if (!this.selectedProjectId || this.selectedProjectId === '') {
      return this.getTotalTeamMembers();
    }
    return this.getSelectedProjectMemberCount();
  }

  getFilteredSubTasksCount(): number {
    if (!this.selectedProjectId || this.selectedProjectId === '') {
      return this.managerSubTasks.length;
    }
    return this.managerSubTasks.filter(task => task.projectId === Number(this.selectedProjectId)).length;
  }

  getProjectCompletionRate(): number {
    const filteredTasks = this.getFilteredManagerSubTasks();
    if (filteredTasks.length === 0) return 0;
    const completed = filteredTasks.filter(task => task.status === 'DONE').length;
    return Math.round((completed / filteredTasks.length) * 100);
  }

  getFilteredManagerSubTasks(): any[] {
    if (!this.selectedProjectId || this.selectedProjectId === '') {
      return this.managerSubTasks;
    }
    return this.managerSubTasks.filter(task => task.projectId === Number(this.selectedProjectId));
  }

  getNotStartedSubTasksCount(): number {
    return this.getFilteredManagerSubTasks().filter(task => task.status === 'NOT_STARTED').length;
  }

  getInProgressSubTasksCount(): number {
    return this.getFilteredManagerSubTasks().filter(task => task.status === 'IN_PROGRESS').length;
  }

  getCompletedSubTasksCount(): number {
    return this.getFilteredManagerSubTasks().filter(task => task.status === 'DONE').length;
  }

  getProjectSubTasksCount(projectId: number): number {
    return this.managerSubTasks.filter(task => task.projectId === projectId).length;
  }

  getProjectTeamMembers(): any[] {
    if (!this.selectedProjectId) return [];
    
    const memberStats = new Map();
    const filteredTasks = this.getFilteredManagerSubTasks();
    
    filteredTasks.forEach(subtask => {
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

  getUpcomingDeadlines(): any[] {
    const upcoming = this.getFilteredManagerSubTasks()
      .filter(task => task.status !== 'DONE' && new Date(task.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
    return upcoming;
  }

  getCompletedPersonalTasksCount(): number {
    return this.personalTasks.filter(task => task.status === 'DONE').length;
  }

  getPendingPersonalTasksCount(): number {
    return this.personalTasks.filter(task => task.status !== 'DONE').length;
  }

  getPersonalTaskCompletionRate(): number {
    if (this.personalTasks.length === 0) return 0;
    return Math.round((this.getCompletedPersonalTasksCount() / this.personalTasks.length) * 100);
  }

  onProjectFilterChange(): void {
    // Filter is handled by the getter methods
  }

  onSubTaskFilterChange(): void {
    this.subTasksCurrentPage = 0;
  }

  resetProjectForm(): void {
    this.projectObj = new ProjectRequestModel();
    this.selectedTlUsername = '';
    this.selectedMemberUsernames = [];
  }

  getTLUsers(): any[] {
    return this.allUsers.filter((user) => user.role === 'TL');
  }

  getMemberUsers(): any[] {
    return this.allUsers.filter((user) => user.role === 'MEMBER');
  }

  onMemberSelect(username: string, event: any): void {
    if (event.target.checked) {
      this.selectedMemberUsernames.push(username);
    } else {
      this.selectedMemberUsernames = this.selectedMemberUsernames.filter(
        (u) => u !== username
      );
    }
  }

  toggleMemberSelection(username: string): void {
    if (this.selectedMemberUsernames.includes(username)) {
      this.selectedMemberUsernames = this.selectedMemberUsernames.filter(
        (u) => u !== username
      );
    } else {
      this.selectedMemberUsernames.push(username);
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

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project? This will also delete all associated sub-tasks.')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.showToastMessage('Project deleted successfully!');
          this.loadProjects();
          this.loadManagerSubTasks();
        },
        error: (error) => {
          this.showToastMessage('Error deleting project', true);
        },
      });
    }
  }

  editSubTask(subtask: any): void {
    this.editingSubTask = { ...subtask };
    this.editingSubTask.assigneeUsername = subtask.memberUsername;
    if (this.editingSubTask.dueDate) {
      this.editingSubTask.dueDate = this.editingSubTask.dueDate.split('T')[0];
    }
    this.projectService.getProjectMembers(subtask.projectId).subscribe({
      next: (members) => {
        this.editingSubTaskMembers = members;
      },
      error: (error) => {
        console.error('Error loading project members:', error);
      },
    });
  }

  updateSubTask(): void {
    if (!this.editingSubTask) return;

    const updateData = {
      name: this.editingSubTask.name,
      description: this.editingSubTask.description,
      dueDate: this.editingSubTask.dueDate,
      projectId: this.editingSubTask.projectId,
      assigneeUsername: this.editingSubTask.assigneeUsername,
    };

    this.subTaskService.updateSubTask(this.editingSubTask.id, updateData).subscribe({
      next: (updated: any) => {
        this.showToastMessage('Sub-task updated successfully!');
        this.editingSubTask = null;
        this.loadManagerSubTasks();
      },
      error: (error: any) => {
        this.showToastMessage('Error updating sub-task', true);
      },
    });
  }

  cancelSubTaskEdit(): void {
    this.editingSubTask = null;
    this.editingSubTaskMembers = [];
  }

  onSubTaskModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelSubTaskEdit();
    }
  }

  deleteSubTask(subtaskId: number): void {
    if (confirm('Are you sure you want to delete this sub-task?')) {
      this.subTaskService.deleteSubTask(subtaskId).subscribe({
        next: () => {
          this.showToastMessage('Sub-task deleted successfully!');
          this.loadManagerSubTasks();
        },
        error: (error: any) => {
          this.showToastMessage('Error deleting sub-task', true);
        },
      });
    }
  }

  // Pagination methods
  changeManagerSubTasksPage(page: number): void {
    if (page >= 0 && page < this.managerSubTasksTotalPages) {
      this.managerSubTasksPage = page;
      this.loadManagerSubTasks();
    }
  }

  changePersonalTasksPage(page: number): void {
    if (page >= 0 && page < this.personalTasksTotalPages) {
      this.personalTasksPage = page;
      this.loadPersonalTasks();
    }
  }

  getPageNumbers(totalPages: number): number[] {
    const pages = Math.max(1, totalPages);
    return Array.from({length: Math.min(5, pages)}, (_, i) => i);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
