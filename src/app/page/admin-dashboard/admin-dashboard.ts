import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { AdminService } from '../../service/admin';
import { RegisterModel } from '../../model/auth.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <span class="navbar-brand">Admin Dashboard</span>
        <div class="navbar-nav ms-auto">
          <span class="navbar-text me-3">Welcome, {{currentUser}}!</span>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Create New User</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="createUser()">
                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="userObj.name"
                    name="name"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="userObj.username"
                    name="username"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="userObj.password"
                    name="password"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
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
                <button type="submit" class="btn btn-success w-100" [disabled]="!isFormValid()">
                  Create User
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div class="position-fixed bottom-0 end-0 p-3">
        <div class="toast align-items-center text-bg-success border-0" 
             [class.show]="showToast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">{{toastMessage}}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    (click)="hideToast()" aria-label="Close"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 10px;
      border: none;
    }
    .card-header {
      border-radius: 10px 10px 0 0 !important;
    }
    .navbar-brand {
      font-weight: bold;
    }
    .stats-card {
      transition: transform 0.2s;
    }
    .stats-card:hover {
      transform: translateY(-2px);
    }
    .toast.show {
      display: block;
    }
    .toast {
      display: none;
    }
  `]
})
export class AdminDashboard implements OnInit {
  auth = inject(Auth);
  adminService = inject(AdminService);
  router = inject(Router);

  currentUser: string = '';
  userObj: RegisterModel = new RegisterModel();
  selectedRole: string = '';
  showToast = false;
  toastMessage = '';

  ngOnInit(): void {
    this.currentUser = this.auth.getUserName() || 'Admin';
  }

  createUser(): void {
    if (!this.isFormValid()) return;

    this.adminService.createManagerOrTL(this.selectedRole, this.userObj).subscribe({
      next: (response) => {
        this.showToastMessage(response || 'User created successfully!');
        this.resetForm();
      },
      error: (error) => {
        const errorMsg = error.status === 409 ? 'Username already exists' : 
                        (error.error || 'Unknown error');
        this.showToastMessage('Error creating user: ' + errorMsg);
      }
    });
  }

  isFormValid(): boolean {
    return this.userObj.name.trim() !== '' &&
           this.userObj.username.trim() !== '' &&
           this.userObj.password.trim() !== '' &&
           this.selectedRole !== '';
  }

  resetForm(): void {
    this.userObj = new RegisterModel();
    this.selectedRole = '';
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.hideToast(), 5000);
  }

  hideToast(): void {
    this.showToast = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}