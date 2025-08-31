import { Component, signal } from '@angular/core';
import { Login } from './page/login/login';

@Component({
  selector: 'app-root',
  imports: [ Login],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
}
