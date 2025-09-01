import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TodoService } from '../../service/todo';
import { Task, TaskResponse } from '../../model/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo implements OnInit {
  router = inject(Router);
  todoService = inject(TodoService);

  taskObj: Task = new Task();
  taskList: TaskResponse[] = [];

  // pagination variables
  page: number = 0;
  size: number = 5;
  totalPages: number = 0;

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(page: number = 0) {
    this.todoService.getAllTasks(page, this.size).subscribe({
      next: (res: any) => {
        this.taskList = res.content || [];
        this.page = res.number;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      },
    });
  }

  // pagination controls
  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.loadTasks(this.page + 1);
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.loadTasks(this.page - 1);
    }
  }

  onCreateTask() {
    this.todoService.createTask(this.taskObj).subscribe({
      next: (res) => {
        alert('Task created successfully');
        this.taskObj = new Task(); // reset form
        this.loadTasks(); // refresh list
      },
      error: (err) => {
        console.error('Error creating task:', err);
      },
    });
  }

  onDeleteTask(id: number) {
    this.todoService.deleteTask(id).subscribe({
      next: () => {
        alert('Task deleted successfully');
        this.loadTasks(); // refresh list
      },
      error: (err) => {
        console.error('Error deleting task:', err);
      },
    });
  }
}
