import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { AdminService } from '../../service/admin';
import { ProjectService } from '../../service/project';
import { SubTaskService } from '../../service/subtask';
import { RegisterModel } from '../../model/auth.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
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
            <i class="far fa-chart-bar me-2"></i>System Overview
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'projects'"
            (click)="setActiveTab('projects')"
          >
            <i class="far fa-folder me-2"></i>All Projects
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'create-user'"
            (click)="setActiveTab('create-user')"
          >
            <i class="far fa-user me-2"></i>Create User
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'all-users'"
            (click)="setActiveTab('all-users')"
          >
            <i class="far fa-address-book me-2"></i>All Users
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'subtasks'"
            (click)="setActiveTab('subtasks')"
          >
            <i class="far fa-list-alt me-2"></i>Sub-Tasks
          </button>
        </li>
        <li>
          <button
            class="sidebar-link"
            [class.active]="activeTab === 'analytics'"
            (click)="setActiveTab('analytics')"
          >
            <i class="far fa-chart-bar me-2"></i>Analytics
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
            <div class="card border-primary overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-project-diagram text-primary fs-1 mb-2"></i>
                <h5 class="text-primary">Total Projects</h5>
                <h2 class="text-dark">{{ allProjects.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-success overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-users text-success fs-1 mb-2"></i>
                <h5 class="text-success">Total Users</h5>
                <h2 class="text-dark">{{ allUsers.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-info overview-metric-card">
              <div class="card-body text-center">
                <i class="fas fa-tasks text-info fs-1 mb-2"></i>
                <h5 class="text-info">Total Sub-Tasks</h5>
                <h2 class="text-dark">{{ allSubTasks.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-secondary overview-metric-card">
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
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 text-dark">All Projects Overview</h5>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <input type="text" 
                       class="form-control form-control-sm" 
                       placeholder="Search projects..." 
                       [(ngModel)]="projectSearchTerm">
              </div>
            </div>
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
                  <tr *ngFor="let project of getFilteredProjects()">
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
                  <tr *ngIf="getFilteredProjects().length === 0">
                    <td colspan="7" class="text-center text-muted">
                      No projects found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="allProjects.length > 0" class="pagination">
              <button class="btn" 
                      [disabled]="projectsPage === 0"
                      (click)="changeProjectsPage(projectsPage - 1)">
                Previous
              </button>
              <span class="page-info">
                Page {{projectsPage + 1}} of {{projectsTotalPages}}
                ({{allProjects.length}} total)
              </span>
              <button class="btn"
                      [disabled]="projectsPage >= projectsTotalPages - 1"
                      (click)="changeProjectsPage(projectsPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create User Tab -->
      <div *ngIf="activeTab === 'create-user'" class="tab-content">
        <div class="row">
          <div class="col-md-6">
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
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">User Creation Guide</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <h6>Role Descriptions</h6>
                  <ul class="mb-0">
                    <li><strong>Manager:</strong> Can create projects, assign team leads, and manage sub-tasks</li>
                    <li><strong>Team Lead:</strong> Can create sub-tasks and manage team members within projects</li>
                    <li><strong>Member:</strong> Can work on assigned sub-tasks and manage personal tasks</li>
                  </ul>
                </div>
                <div class="alert alert-warning">
                  <h6>Important Notes</h6>
                  <ul class="mb-0">
                    <li>Username must be unique across the system</li>
                    <li>Password should be secure and memorable</li>
                    <li>Role cannot be changed after user creation</li>
                    <li>Users will receive login credentials via email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Users Tab -->
      <div *ngIf="activeTab === 'all-users'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 text-dark">All Users</h5>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <input type="text" 
                       class="form-control form-control-sm" 
                       placeholder="Search users..." 
                       [(ngModel)]="userSearchTerm">
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="selectedUserRole">
                  <option value="">All Roles</option>
                  <option value="MANAGER">Manager</option>
                  <option value="TL">Team Lead</option>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
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
            <div *ngIf="allUsers.length > 0" class="pagination">
              <button class="btn" 
                      [disabled]="usersPage === 0"
                      (click)="changeUsersPage(usersPage - 1)">
                Previous
              </button>
              <span class="page-info">
                Page {{usersPage + 1}} of {{usersTotalPages}}
                ({{allUsers.length}} total)
              </span>
              <button class="btn"
                      [disabled]="usersPage >= usersTotalPages - 1"
                      (click)="changeUsersPage(usersPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-Tasks Tab -->
      <div *ngIf="activeTab === 'subtasks'" class="tab-content">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0 text-dark">All Sub-Tasks</h5>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <input type="text" 
                       class="form-control form-control-sm" 
                       placeholder="Search sub-tasks..." 
                       [(ngModel)]="subTaskSearchTerm">
              </div>
              <div class="col-md-3">
                <select class="form-select form-select-sm" [(ngModel)]="subTaskStatusFilter">
                  <option value="">All Status</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
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
                  <tr *ngFor="let subtask of getFilteredSubTasks()">
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
                  <tr *ngIf="getFilteredSubTasks().length === 0">
                    <td colspan="6" class="text-center text-muted">
                      No sub-tasks found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="allSubTasks.length > 0" class="pagination">
              <button class="btn" 
                      [disabled]="subTasksPage === 0"
                      (click)="changeSubTasksPage(subTasksPage - 1)">
                Previous
              </button>
              <span class="page-info">
                Page {{subTasksPage + 1}} of {{subTasksTotalPages}}
                ({{allSubTasks.length}} total)
              </span>
              <button class="btn"
                      [disabled]="subTasksPage >= subTasksTotalPages - 1"
                      (click)="changeSubTasksPage(subTasksPage + 1)">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div *ngIf="activeTab === 'analytics'" class="tab-content">
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Task Status Distribution</h5>
              </div>
              <div class="card-body">
                <canvas #taskStatusChart width="400" height="200"></canvas>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">User Roles Distribution</h5>
              </div>
              <div class="card-body">
                <canvas #userRolesChart width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0 text-dark">Project Completion Progress</h5>
              </div>
              <div class="card-body">
                <canvas #projectProgressChart width="800" height="300"></canvas>
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
export class AdminDashboard implements OnInit, AfterViewInit {
  @ViewChild('taskStatusChart') taskStatusChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userRolesChart') userRolesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projectProgressChart') projectProgressChart!: ElementRef<HTMLCanvasElement>;

  private taskChart: any;
  private userChart: any;
  private projectChart: any;
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
  
  // Filters
  projectSearchTerm = '';
  userSearchTerm = '';
  subTaskSearchTerm = '';
  projectStatusFilter = '';
  subTaskStatusFilter = '';
  
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  initializeCharts(): void {
    this.createTaskStatusChart();
    this.createUserRolesChart();
    this.createProjectProgressChart();
  }

  createTaskStatusChart(): void {
    if (!this.taskStatusChart?.nativeElement) return;
    
    const notStarted = this.allSubTasks.filter(t => t.status === 'NOT_STARTED').length;
    const inProgress = this.allSubTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const done = this.allSubTasks.filter(t => t.status === 'DONE').length;

    this.taskChart = new Chart(this.taskStatusChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Not Started', 'In Progress', 'Done'],
        datasets: [{
          data: [notStarted, inProgress, done],
          backgroundColor: ['#6c757d', '#2563eb', '#198754']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  createUserRolesChart(): void {
    if (!this.userRolesChart?.nativeElement) return;
    
    const managers = this.allUsers.filter(u => u.role === 'MANAGER').length;
    const tls = this.allUsers.filter(u => u.role === 'TL').length;
    const members = this.allUsers.filter(u => u.role === 'MEMBER').length;
    const admins = this.allUsers.filter(u => u.role === 'ADMIN').length;

    this.userChart = new Chart(this.userRolesChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Managers', 'Team Leads', 'Members', 'Admins'],
        datasets: [{
          data: [managers, tls, members, admins],
          backgroundColor: ['#2563eb', '#198754', '#17a2b8', '#343a40']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  createProjectProgressChart(): void {
    if (!this.projectProgressChart?.nativeElement) return;
    
    const projectNames = this.allProjects.map(p => p.name);
    const completionRates = this.allProjects.map(p => this.getProjectCompletionRate(p.id));

    this.projectChart = new Chart(this.projectProgressChart.nativeElement, {
      type: 'bar',
      data: {
        labels: projectNames,
        datasets: [{
          label: 'Completion %',
          data: completionRates,
          backgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  loadDashboardData(): void {
    this.loadAllProjects();
    this.loadAllUsers();
    this.loadAllSubTasks();
  }

  updateCharts(): void {
    if (this.taskChart) {
      this.taskChart.destroy();
      this.createTaskStatusChart();
    }
    if (this.userChart) {
      this.userChart.destroy();
      this.createUserRolesChart();
    }
    if (this.projectChart) {
      this.projectChart.destroy();
      this.createProjectProgressChart();
    }
  }

  loadAllProjects(): void {
    this.adminService.getAllProjects(this.projectsPage, this.projectsSize).subscribe({
      next: (response) => {
        this.allProjects = response.content || response || [];
        this.projectsTotalPages = Math.max(1, response.totalPages || 0);
        this.updateCharts();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.allProjects = [];
      },
    });
  }

  loadAllUsers(): void {
    this.projectService.getAllUsers().subscribe({
      next: (response: any) => {
        this.allUsers = response || [];
        // Calculate pagination manually since backend returns all users
        const totalUsers = this.allUsers.length;
        this.usersTotalPages = Math.ceil(totalUsers / this.usersSize);
        // Slice users for current page
        const startIndex = this.usersPage * this.usersSize;
        const endIndex = startIndex + this.usersSize;
        this.allUsers = this.allUsers.slice(startIndex, endIndex);
        this.updateCharts();
      },
      error: (error: any) => {
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
        this.updateCharts();
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
    if (tab === 'analytics') {
      setTimeout(() => this.initializeCharts(), 100);
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



  getFilteredCompletedSubTasks(): number {
    return this.getFilteredSubTasks().filter((task) => task.status === 'DONE')
      .length;
  }

  getFilteredPendingSubTasks(): number {
    return this.getFilteredSubTasks().filter((task) => task.status !== 'DONE')
      .length;
  }

  getFilteredUsers(): any[] {
    let filtered = this.allUsers;
    
    if (this.selectedUserRole && this.selectedUserRole !== '') {
      filtered = filtered.filter((user) => user.role === this.selectedUserRole);
    }
    
    if (this.userSearchTerm) {
      const term = this.userSearchTerm.toLowerCase();
      filtered = filtered.filter((user) => 
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }
  
  getFilteredProjects(): any[] {
    let filtered = this.allProjects;
    
    if (this.projectSearchTerm) {
      const term = this.projectSearchTerm.toLowerCase();
      filtered = filtered.filter((project) => 
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.managerUsername.toLowerCase().includes(term) ||
        project.tlUsername.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }
  
  getFilteredSubTasks(): any[] {
    let filtered = this.allSubTasks;
    
    if (this.subTaskSearchTerm) {
      const term = this.subTaskSearchTerm.toLowerCase();
      filtered = filtered.filter((task) => 
        task.name.toLowerCase().includes(term) ||
        task.projectName.toLowerCase().includes(term) ||
        task.memberUsername.toLowerCase().includes(term)
      );
    }
    
    if (this.subTaskStatusFilter && this.subTaskStatusFilter !== '') {
      filtered = filtered.filter((task) => task.status === this.subTaskStatusFilter);
    }
    
    return filtered;
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