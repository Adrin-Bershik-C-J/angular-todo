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
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container">
        <span class="navbar-brand text-primary fw-bold">Admin Dashboard</span>
        <button class="navbar-toggler" type="button" (click)="toggleNavbar()">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [class.show]="isNavbarCollapsed" id="navbarNav">
          <div class="navbar-nav ms-auto d-flex align-items-center">
            <button
              class="nav-link btn btn-link"
              [class.active]="activeTab === 'overview'"
              (click)="setActiveTab('overview')"
            >
              System Overview
            </button>
            <button
              class="nav-link btn btn-link"
              [class.active]="activeTab === 'projects'"
              (click)="setActiveTab('projects')"
            >
              All Projects
            </button>
            <button
              class="nav-link btn btn-link"
              [class.active]="activeTab === 'users'"
              (click)="setActiveTab('users')"
            >
              User Management
            </button>
            <button
              class="nav-link btn btn-link"
              [class.active]="activeTab === 'analytics'"
              (click)="setActiveTab('analytics')"
            >
              Analytics
            </button>
            <span class="navbar-text me-3 text-dark ms-3">
              Welcome, <span class="fw-bold">{{ currentUser }}!</span>
            </span>
            <button class="btn btn-outline-primary btn-sm" (click)="logout()">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4">


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
                    <span
                      class="badge"
                      [ngClass]="{
                        'bg-success': getProjectStatus(project) === 'Completed',
                        'bg-warning':
                          getProjectStatus(project) === 'In Progress',
                        'bg-secondary':
                          getProjectStatus(project) === 'Not Started'
                      }"
                      >{{ getProjectStatus(project) }}</span
                    >
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
                    <th class="text-dark">Status</th>
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
                      <span
                        class="badge"
                        [ngClass]="{
                          'bg-success':
                            getProjectStatus(project) === 'Completed',
                          'bg-warning':
                            getProjectStatus(project) === 'In Progress',
                          'bg-secondary':
                            getProjectStatus(project) === 'Not Started'
                        }"
                        >{{ getProjectStatus(project) }}</span
                      >
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
                      </tr>
                      <tr *ngIf="getFilteredUsers().length === 0">
                        <td colspan="4" class="text-center text-muted">
                          No users found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
      .card {
        border-radius: 10px;
      }
      .table th {
        border-top: none;
        font-weight: 600;
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
      body {
        background-color: #f8f9fa;
      }
      .fs-1 {
        font-size: 2.5rem;
      }
      .btn-group-sm .btn {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
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
  isNavbarCollapsed = false;

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
    this.adminService.getAllProjects().subscribe({
      next: (projects) => {
        this.allProjects = projects;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.allProjects = [];
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
        this.allUsers = [];
      },
    });
  }

  loadAllSubTasks(): void {
    this.adminService.getAllSubTasks().subscribe({
      next: (subtasks) => {
        this.allSubTasks = subtasks;
      },
      error: (error) => {
        console.error('Error loading subtasks:', error);
        this.allSubTasks = [];
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
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

  getProjectStatus(project: any): string {
    const projectTasks = this.allSubTasks.filter(
      (task) => task.projectId === project.id
    );
    if (projectTasks.length === 0) return 'Not Started';

    const completed = projectTasks.filter(
      (task) => task.status === 'DONE'
    ).length;
    if (completed === projectTasks.length) return 'Completed';
    if (completed > 0) return 'In Progress';
    return 'Not Started';
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

  getProjectsDueThisMonth(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return this.allProjects.filter((project) => {
      const dueDate = new Date(project.dueDate);
      return (
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear
      );
    }).length;
  }

  getOverdueProjects(): number {
    const today = new Date();
    return this.allProjects.filter(
      (project) => new Date(project.dueDate) < today
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

  getAverageTasksPerProject(): number {
    if (this.allProjects.length === 0) return 0;
    return Math.round(this.allSubTasks.length / this.allProjects.length);
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

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
