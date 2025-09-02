import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TodoService } from '../../service/todo';
import { Task, TaskResponse } from '../../model/todo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from 'bootstrap'; // 👈 Import bootstrap toast

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

  // edit state
  editTaskObj: any = {};
  editingTaskId: number | null = null;

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
        this.showToast('Error loading tasks', true);
      },
    });
  }

  // toast function
  showToast(message: string, isError: boolean = false) {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');
    if (toastEl && toastBody) {
      toastBody.textContent = message;
      toastEl.classList.remove('text-bg-success', 'text-bg-danger');
      toastEl.classList.add(isError ? 'text-bg-danger' : 'text-bg-success');
      const toast = new Toast(toastEl);
      toast.show();
    }
  }

  // create
  onCreateTask() {
    this.todoService.createTask(this.taskObj).subscribe({
      next: () => {
        this.showToast('Task created successfully');
        this.taskObj = new Task();
        this.loadTasks();
      },
      error: () => {
        this.showToast('Error creating task', true);
      },
    });
  }

  // delete
  onDeleteTask(id: number) {
    this.todoService.deleteTask(id).subscribe({
      next: () => {
        this.showToast('Task deleted successfully');
        this.loadTasks();
      },
      error: () => {
        this.showToast('Error deleting task', true);
      },
    });
  }

  // open edit modal
  openEditModal(task: TaskResponse) {
    this.editTaskObj = { ...task };

    // convert ISO string → yyyy-MM-dd for <input type="date">
    if (this.editTaskObj.dueDate) {
      this.editTaskObj.dueDate = this.editTaskObj.dueDate.split('T')[0];
    }

    this.editingTaskId = task.id;
  }

  // update (PATCH)
  onUpdateTask() {
    if (!this.editingTaskId) return;

    const payload: any = { ...this.editTaskObj };

    if (payload.dueDate) {
      // ensure it's yyyy-MM-dd before making ISO
      const dateOnly = payload.dueDate.split('T')[0];
      payload.dueDate = new Date(dateOnly + 'T00:00:00').toISOString();
    }

    this.todoService.updateTask(this.editingTaskId, payload).subscribe({
      next: () => {
        this.showToast('Task updated successfully');
        this.loadTasks();
        this.editingTaskId = null;
      },
      error: () => {
        this.showToast('Error updating task', true);
      },
    });
  }

  // pagination
  nextPage() {
    if (this.page < this.totalPages - 1) this.loadTasks(this.page + 1);
  }

  prevPage() {
    if (this.page > 0) this.loadTasks(this.page - 1);
  }
}
