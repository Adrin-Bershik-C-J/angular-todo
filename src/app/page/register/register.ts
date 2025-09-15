import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../service/auth';
import { RegisterModel } from '../../model/auth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  router = inject(Router);
  authService = inject(Auth);

  registerObj: RegisterModel = new RegisterModel();
  isLoading = false;

  onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.authService.register(this.registerObj).subscribe({
      next: (res: any) => {
        alert(res.message || 'Account created successfully!');
        this.router.navigateByUrl('/login');
        this.isLoading = false;
      },
      error: (err) => {
        alert(err.error?.error || 'Registration failed. Please try again.');
        this.isLoading = false;
      },
    });
  }
}
