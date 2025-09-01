import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../service/auth';
import { LoginModel } from '../../model/auth.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  router = inject(Router);
  authService = inject(Auth);

  loginObj: LoginModel = new LoginModel();

  onSubmit() {
    this.authService.login(this.loginObj).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/todo');
      },
      error: (err) => {
        alert(err.error?.error || 'API Error');
      },
    });
  }
}
