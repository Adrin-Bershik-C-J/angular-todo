import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../service/auth';
import { LoginModel } from '../../model/auth.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  router = inject(Router);
  authService = inject(Auth);

  loginObj: LoginModel = new LoginModel();
  isLoading = false;

  onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.authService.login(this.loginObj).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        
        // Get user details to determine role-based redirection
        this.authService.getCurrentUser().subscribe({
          next: (user: any) => {
            localStorage.setItem('role', user.role);
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('name', user.name);
            
            // Role-based redirection
            switch (user.role) {
              case 'ADMIN':
                this.router.navigateByUrl('/dashboard/admin');
                break;
              case 'MANAGER':
                this.router.navigateByUrl('/dashboard/manager');
                break;
              case 'TL':
                this.router.navigateByUrl('/dashboard/tl');
                break;
              case 'MEMBER':
                this.router.navigateByUrl('/dashboard/member');
                break;
              default:
                this.router.navigateByUrl('/todo');
            }
            this.isLoading = false;
          },
          error: (userErr) => {
            console.error('Error getting user details:', userErr);
            // Fallback to todo page if user details fetch fails
            this.router.navigateByUrl('/todo');
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.error || 'Login failed. Please check your credentials.');
      },
    });
  }
}