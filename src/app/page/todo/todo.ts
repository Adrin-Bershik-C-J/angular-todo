import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TodoService } from '../../service/todo';
import { Task, TaskResponse } from '../../model/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  imports: [CommonModule,FormsModule],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo implements OnInit {
  router = inject(Router);
  todoService = inject(TodoService);

  taskObj: Task = new Task();
  taskList: TaskResponse[] = [];

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.todoService.getAllTasks().subscribe({
      next: (res: any) => {
        // backend returns Page<ToDoResponseDTO>, so actual list is inside res.content
        this.taskList = res.content || [];
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      },
    });
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
