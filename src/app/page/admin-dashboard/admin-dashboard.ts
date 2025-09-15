import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { AdminService } from '../../service/admin';
import { ProjectService } from '../../service/project';
import { SubTaskService } from '../../service/subtask';
import { RegisterModel } from '../../model/auth.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Top Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top">
      <div class="container-fluid">
        <button class="btn btn-primary d-lg-none me-2" (click)="toggleSidebar()">
          <span class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <span class="navbar-brand text-primary fw-bold mb-0">Admin Dashboard</span>
        <div class="ms-auto d-flex align-items-center">
          <span class="navbar-text me-3 text-dark d-none d-lg-block">
            Welcome, <span class="fw-bold">System Admin!</span>
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
          <span class="text-dark fw-bold">Welcome, System Admin!</span>
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
            <i class="fas fa-tachometer-alt me-2"></i>System Overview
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'projects'"
            (click)="setActiveTab('projects')"
          >
            <i class="fas fa-project-diagram me-2"></i>All Projects
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'users'"
            (click)="setActiveTab('users')"
          >
            <i class="fas fa-users me-2"></i>User Management
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'subtasks'"
            (click)="setActiveTab('subtasks')"
          >
            <i class="fas fa-tasks me-2"></i>Sub-Tasks
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'analytics'"
            (click)="setActiveTab('analytics')"
          >
            <i class="fas fa-chart-line me-2"></i>Analytics
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

      <!-- System Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="tab-content">
        <!-- Key Metrics -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <i class="fas fa-project-diagram text-primary fs-1 mb-2"></i>
                <h5 class="text-primary">Total Projects</h5>
                <h2 class="text-dark">{{ allProjects.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <i class="fas fa-users text-success fs-1 mb-2"></i>
                <h5 class="text-success">Total Users</h5>
                <h2 class="text-dark">{{ allUsers.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <i class="fas fa-tasks text-info fs-1 mb-2"></i>
                <h5 class="text-info">Total Sub-Tasks</h5>
                <h2 class="text-dark">{{ allSubTasks.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-secondary">
              <div class="card-body text-center">
                <i class="fas fa-chart-line text-secondary fs-1 mb-2"></i>
                <h5 class="text-secondary">Completion Rate</h5>
                <h2 class="text-dark">{{ getOverallCompletionRate() }}%</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Recent Projects</h5>
              </div>
              <div class="card-body">
                <div
                  *ngFor="let project of allProjects.slice(0, 5)"
                  class="mb-3 p-3 border rounded"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="text-primary">{{ project.name }}</h6>
                      <p class="text-muted mb-1 small">
                        {{ project.description }}
                      </p>
                      <small class="text-secondary"
                        >Manager: {{ project.managerUsername }} | TL:
                        {{ project.tlUsername }}</small
                      >
                    </div>
                    <button
                      class="btn btn-danger btn-sm"
                      (click)="deleteProject(project.id)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div *ngIf="allProjects.length === 0" class="text-muted">
                  No projects found
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">System Statistics</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Active Projects</span>
                    <span class="badge bg-primary">{{
                      getActiveProjectsCount()
                    }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Managers</span>
                    <span class="badge bg-success">{{
                      getManagersCount()
                    }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Team Leads</span>
                    <span class="badge bg-info">{{ getTLsCount() }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Members</span>
                    <span class="badge bg-secondary">{{
                      getMembersCount()
                    }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Completed Sub-Tasks</span>
                    <span class="badge bg-success">{{
                      getCompletedSubTasksCount()
                    }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Pending Sub-Tasks</span>
                    <span class="badge bg-danger">{{
                      getPendingSubTasksCount()
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Projects Tab -->
      <div *ngIf="activeTab === 'projects'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0 text-dark">All Projects Overview</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th class="text-dark">Project Name</th>
                    <th class="text-dark">Manager</th>
                    <th class="text-dark">Team Lead</th>
                    <th class="text-dark">Members</th>
                    <th class="text-dark">Due Date</th>
                    <th class="text-dark">Sub-Tasks</th>
                    <th class="text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let project of allProjects">
                    <td>
                      <strong class="text-primary">{{ project.name }}</strong>
                      <br /><small class="text-muted">{{
                        project.description
                      }}</small>
                    </td>
                    <td class="text-dark">{{ project.managerUsername }}</td>
                    <td class="text-dark">{{ project.tlUsername }}</td>
                    <td>
                      <span class="badge bg-secondary"
                        >{{
                          project.memberUsernames?.length || 0
                        }}
                        members</span
                      >
                    </td>
                    <td class="text-dark">{{ project.dueDate | date }}</td>
                    <td>
                      <span class="badge bg-info"
                        >{{ getProjectSubTasksCount(project.id) }} tasks</span
                      >
                    </td>
                    <td>
                      <button
                        class="btn btn-danger btn-sm"
                        (click)="deleteProject(project.id)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="allProjects.length === 0">
                    <td colspan="7" class="text-center text-muted">
                      No projects found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination Info -->
            <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="allProjects.length > 0">
              <small class="text-muted">Page {{projectsPage + 1}} of {{projectsTotalPages}} ({{allProjects.length}} items)</small>
            </div>
            <!-- Pagination for Projects -->
            <nav *ngIf="allProjects.length > 0">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="projectsPage === 0">
                  <button class="page-link" (click)="changeProjectsPage(projectsPage - 1)">Previous</button>
                </li>
                <li class="page-item" *ngFor="let page of getPageNumbers(projectsTotalPages)" [class.active]="page === projectsPage">
                  <button class="page-link" (click)="changeProjectsPage(page)">{{page + 1}}</button>
                </li>
                <li class="page-item" [class.disabled]="projectsPage >= projectsTotalPages - 1">
                  <button class="page-link" (click)="changeProjectsPage(projectsPage + 1)">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- User Management Tab -->
      <div *ngIf="activeTab === 'users'" class="tab-content">
        <div class="row">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Create New User</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createUser()">
                  <div class="mb-3">
                    <label class="form-label text-dark">Name</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="userObj.name"
                      name="name"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-dark">Username</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="userObj.username"
                      name="username"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-dark">Password</label>
                    <input
                      type="password"
                      class="form-control"
                      [(ngModel)]="userObj.password"
                      name="password"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-dark">Role</label>
                    <select
                      class="form-select"
                      [(ngModel)]="selectedRole"
                      name="role"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="MANAGER">Manager</option>
                      <option value="TL">Team Lead</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    Create User
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div
                class="card-header bg-light d-flex justify-content-between align-items-center"
              >
                <h5 class="mb-0 text-dark">All Users</h5>
                <div>
                  <label class="form-label text-dark me-2"
                    >Filter by Role:</label
                  >
                  <select
                    class="form-select form-select-sm"
                    [(ngModel)]="selectedUserRole"
                    style="width: auto; display: inline-block;"
                  >
                    <option value="">All Roles</option>
                    <option value="MANAGER">Manager</option>
                    <option value="TL">Team Lead</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th class="text-dark">Name</th>
                        <th class="text-dark">Username</th>
                        <th class="text-dark">Role</th>
                        <th class="text-dark">Projects Involved</th>
                        <th class="text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let user of getFilteredUsers()">
                        <td class="text-dark">{{ user.name }}</td>
                        <td class="text-dark">{{ user.username }}</td>
                        <td>
                          <span
                            class="badge"
                            [ngClass]="{
                              'bg-primary': user.role === 'MANAGER',
                              'bg-success': user.role === 'TL',
                              'bg-info': user.role === 'MEMBER',
                              'bg-dark': user.role === 'ADMIN'
                            }"
                            >{{ user.role }}</span
                          >
                        </td>
                        <td>
                          <span class="badge bg-secondary"
                            >{{
                              getUserProjectsCount(user.username)
                            }}
                            projects</span
                          >
                        </td>
                        <td>
                          <button
                            class="btn btn-danger btn-sm"
                            (click)="deleteUser(user.username)"
                            [disabled]="user.role === 'ADMIN'"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      <tr *ngIf="getFilteredUsers().length === 0">
                        <td colspan="5" class="text-center text-muted">
                          No users found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- Pagination Info -->
                <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="allUsers.length > 0">
                  <small class="text-muted">Page {{usersPage + 1}} of {{usersTotalPages}} ({{allUsers.length}} items)</small>
                </div>
                <!-- Pagination for Users -->
                <nav *ngIf="allUsers.length > 0">
                  <ul class="pagination justify-content-center">
                    <li class="page-item" [class.disabled]="usersPage === 0">
                      <button class="page-link" (click)="changeUsersPage(usersPage - 1)">Previous</button>
                    </li>
                    <li class="page-item" *ngFor="let page of getPageNumbers(usersTotalPages)" [class.active]="page === usersPage">
                      <button class="page-link" (click)="changeUsersPage(page)">{{page + 1}}</button>
                    </li>
                    <li class="page-item" [class.disabled]="usersPage >= usersTotalPages - 1">
                      <button class="page-link" (click)="changeUsersPage(usersPage + 1)">Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'subtasks'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0 text-dark">All Sub-Tasks</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th class="text-dark">Sub-Task</th>
                    <th class="text-dark">Project</th>
                    <th class="text-dark">Assigned To</th>
                    <th class="text-dark">Status</th>
                    <th class="text-dark">Due Date</th>
                    <th class="text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let subtask of allSubTasks">
                    <td class="text-dark">{{ subtask.name }}</td>
                    <td class="text-dark">{{ subtask.projectName }}</td>
                    <td class="text-dark">{{ subtask.memberUsername }}</td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="{
                          'bg-secondary': subtask.status === 'NOT_STARTED',
                          'bg-primary': subtask.status === 'IN_PROGRESS',
                          'bg-success': subtask.status === 'DONE'
                        }"
                        >{{ subtask.status }}</span
                      >
                    </td>
                    <td class="text-dark">{{ subtask.dueDate | date }}</td>
                    <td>
                      <button
                        class="btn btn-danger btn-sm"
                        (click)="deleteSubTask(subtask.id)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="allSubTasks.length === 0">
                    <td colspan="6" class="text-center text-muted">
                      No sub-tasks found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination Info -->
            <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="allSubTasks.length > 0">
              <small class="text-muted">Page {{subTasksPage + 1}} of {{subTasksTotalPages}} ({{allSubTasks.length}} items)</small>
            </div>
            <!-- Pagination for Sub-Tasks -->
            <nav *ngIf="allSubTasks.length > 0">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="subTasksPage === 0">
                  <button class="page-link" (click)="changeSubTasksPage(subTasksPage - 1)">Previous</button>
                </li>
                <li class="page-item" *ngFor="let page of getPageNumbers(subTasksTotalPages)" [class.active]="page === subTasksPage">
                  <button class="page-link" (click)="changeSubTasksPage(page)">{{page + 1}}</button>
                </li>
                <li class="page-item" [class.disabled]="subTasksPage >= subTasksTotalPages - 1">
                  <button class="page-link" (click)="changeSubTasksPage(subTasksPage + 1)">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div *ngIf="activeTab === 'analytics'" class="tab-content">
        <!-- Project Filter -->
        <div class="row mb-3">
          <div class="col-md-4">
            <label class="form-label text-dark">Filter by Project:</label>
            <select class="form-select" [(ngModel)]="selectedProjectId">
              <option value="">All Projects</option>
              <option *ngFor="let project of allProjects" [value]="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Project Performance</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let project of getFilteredProjects()" class="mb-3">
                  <div
                    class="d-flex justify-content-between align-items-center mb-1"
                  >
                    <span class="text-dark fw-bold">{{ project.name }}</span>
                    <span class="text-muted"
                      >{{ getProjectCompletionRate(project.id) }}%</span
                    >
                  </div>
                  <div class="progress">
                    <div
                      class="progress-bar bg-success"
                      [style.width.%]="getProjectCompletionRate(project.id)"
                    ></div>
                  </div>
                </div>
                <div
                  *ngIf="getFilteredProjects().length === 0"
                  class="text-muted"
                >
                  No projects to analyze
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Task Distribution</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Total sub-tasks</span>
                    <span class="badge bg-info">{{
                      getFilteredSubTasks().length
                    }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Completed sub-tasks</span>
                    <span class="badge bg-success">{{
                      getFilteredCompletedSubTasks()
                    }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <span class="text-dark">Pending sub-tasks</span>
                    <span class="badge bg-danger">{{
                      getFilteredPendingSubTasks()
                    }}</span>
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
        background: #2563eb;
        color: white;
        border-right: 3px solid #1d4ed8;
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
    `,
  ],
})
export class AdminDashboard implements OnInit {
  auth = inject(Auth);
  adminService = inject(AdminService);
  projectService = inject(ProjectService);
  subTaskService = inject(SubTaskService);
  router = inject(Router);

  currentUser: string = '';
  activeTab: string = 'overview';

  // Data
  allProjects: any[] = [];
  allUsers: any[] = [];
  allSubTasks: any[] = [];
  selectedProjectId: string | null = '';
  selectedUserRole: string = '';

  // Form objects
  userObj: RegisterModel = new RegisterModel();
  selectedRole: string = '';

  // UI state
  showToast = false;
  toastMessage = '';
  toastError = false;
  sidebarOpen = false;
  
  // Pagination
  projectsPage = 0;
  projectsSize = 10;
  projectsTotalPages = 0;
  usersPage = 0;
  usersSize = 10;
  usersTotalPages = 0;
  subTasksPage = 0;
  subTasksSize = 10;
  subTasksTotalPages = 0;

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Admin';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadAllProjects();
    this.loadAllUsers();
    this.loadAllSubTasks();
  }

  loadAllProjects(): void {
    this.adminService.getAllProjects(this.projectsPage, this.projectsSize).subscribe({
      next: (response) => {
        this.allProjects = response.content || response || [];
        this.projectsTotalPages = Math.max(1, response.totalPages || 0);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.allProjects = [];
      },
    });
  }

  loadAllUsers(): void {
    this.projectService.getAllUsers(this.usersPage, this.usersSize).subscribe({
      next: (response) => {
        this.allUsers = response.content || response || [];
        this.usersTotalPages = Math.max(1, response.totalPages || 0);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.allUsers = [];
      },
    });
  }

  loadAllSubTasks(): void {
    this.adminService.getAllSubTasks(this.subTasksPage, this.subTasksSize).subscribe({
      next: (response) => {
        this.allSubTasks = response.content || response || [];
        this.subTasksTotalPages = Math.max(1, response.totalPages || 0);
      },
      error: (error) => {
        console.error('Error loading subtasks:', error);
        this.allSubTasks = [];
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  createUser(): void {
    if (
      !this.userObj.name ||
      !this.userObj.username ||
      !this.userObj.password ||
      !this.selectedRole
    ) {
      this.showToastMessage('Please fill all required fields', true);
      return;
    }

    this.adminService
      .createManagerOrTL(this.selectedRole, this.userObj)
      .subscribe({
        next: (response) => {
          this.showToastMessage('User created successfully!');
          this.resetForm();
          this.usersPage = 0;
          this.loadAllUsers();
        },
        error: (error) => {
          const errorMsg =
            error.status === 409
              ? 'Username already exists'
              : error.error || 'Unknown error';
          this.showToastMessage('Error creating user: ' + errorMsg, true);
        },
      });
  }

  // Analytics methods
  getOverallCompletionRate(): number {
    if (this.allSubTasks.length === 0) return 0;
    const completed = this.allSubTasks.filter(
      (task) => task.status === 'DONE'
    ).length;
    return Math.round((completed / this.allSubTasks.length) * 100);
  }

  getActiveProjectsCount(): number {
    return this.allProjects.filter(
      (project) => new Date(project.dueDate) > new Date()
    ).length;
  }

  getManagersCount(): number {
    return this.allUsers.filter((user) => user.role === 'MANAGER').length;
  }

  getTLsCount(): number {
    return this.allUsers.filter((user) => user.role === 'TL').length;
  }

  getMembersCount(): number {
    return this.allUsers.filter((user) => user.role === 'MEMBER').length;
  }

  getCompletedSubTasksCount(): number {
    return this.allSubTasks.filter((task) => task.status === 'DONE').length;
  }

  getPendingSubTasksCount(): number {
    return this.allSubTasks.filter((task) => task.status !== 'DONE').length;
  }

  deleteUser(username: string): void {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
      this.adminService.deleteUser(username).subscribe({
        next: () => {
          this.showToastMessage('User deleted successfully!');
          this.loadAllUsers();
        },
        error: (error) => {
          this.showToastMessage('Error deleting user: ' + (error.error || 'Unknown error'), true);
        },
      });
    }
  }

  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project? This will also delete all associated sub-tasks.')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.showToastMessage('Project deleted successfully!');
          this.loadAllProjects();
          this.loadAllSubTasks();
        },
        error: (error) => {
          this.showToastMessage('Error deleting project: ' + (error.error || 'Unknown error'), true);
        },
      });
    }
  }

  deleteSubTask(subtaskId: number): void {
    if (confirm('Are you sure you want to delete this sub-task?')) {
      this.subTaskService.deleteSubTask(subtaskId).subscribe({
        next: () => {
          this.showToastMessage('Sub-task deleted successfully!');
          this.loadAllSubTasks();
        },
        error: (error) => {
          this.showToastMessage('Error deleting sub-task: ' + (error.error || 'Unknown error'), true);
        },
      });
    }
  }

  getProjectSubTasksCount(projectId: number): number {
    return this.allSubTasks.filter((task) => task.projectId === projectId)
      .length;
  }

  getProjectCompletionRate(projectId: number): number {
    const projectTasks = this.allSubTasks.filter(
      (task) => task.projectId === projectId
    );
    if (projectTasks.length === 0) return 0;

    const completed = projectTasks.filter(
      (task) => task.status === 'DONE'
    ).length;
    return Math.round((completed / projectTasks.length) * 100);
  }

  getUserProjectsCount(username: string): number {
    return this.allProjects.filter(
      (project) =>
        project.managerUsername === username ||
        project.tlUsername === username ||
        project.memberUsernames?.includes(username)
    ).length;
  }

  getFilteredProjects(): any[] {
    if (!this.selectedProjectId || this.selectedProjectId === '') {
      return this.allProjects;
    }
    return this.allProjects.filter(
      (project) => project.id === Number(this.selectedProjectId)
    );
  }

  getFilteredSubTasks(): any[] {
    if (!this.selectedProjectId || this.selectedProjectId === '') {
      return this.allSubTasks;
    }
    return this.allSubTasks.filter(
      (task) => task.projectId === Number(this.selectedProjectId)
    );
  }

  getFilteredCompletedSubTasks(): number {
    return this.getFilteredSubTasks().filter((task) => task.status === 'DONE')
      .length;
  }

  getFilteredPendingSubTasks(): number {
    return this.getFilteredSubTasks().filter((task) => task.status !== 'DONE')
      .length;
  }

  getFilteredUsers(): any[] {
    if (!this.selectedUserRole || this.selectedUserRole === '') {
      return this.allUsers;
    }
    return this.allUsers.filter((user) => user.role === this.selectedUserRole);
  }

  resetForm(): void {
    this.userObj = new RegisterModel();
    this.selectedRole = '';
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Pagination methods
  changeProjectsPage(page: number): void {
    if (page >= 0 && page < this.projectsTotalPages) {
      this.projectsPage = page;
      this.loadAllProjects();
    }
  }

  changeUsersPage(page: number): void {
    if (page >= 0 && page < this.usersTotalPages) {
      this.usersPage = page;
      this.loadAllUsers();
    }
  }

  changeSubTasksPage(page: number): void {
    if (page >= 0 && page < this.subTasksTotalPages) {
      this.subTasksPage = page;
      this.loadAllSubTasks();
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