import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { RegisterModel } from '../../model/auth.model';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  router = inject(Router);
  authService = inject(Auth);

  registerObj: RegisterModel = new RegisterModel();

  onSubmit() {
    this.authService.register(this.registerObj).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        alert(err.error?.error || 'API Error');
      },
    });
  }
}
