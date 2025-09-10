import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card p-5 text-center shadow">
        <h1 class="text-danger">403</h1>
        <h3>Unauthorized Access</h3>
        <p>You do not have permission to view this page.</p>
        <button class="btn btn-primary mt-3" (click)="goHome()">
          Go to Home
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        max-width: 400px;
      }
    `,
  ],
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigateByUrl('/');
  }
}
