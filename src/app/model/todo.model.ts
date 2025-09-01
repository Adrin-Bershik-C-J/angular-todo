export class Task {
  title: string = '';
  description: string = '';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' = 'NOT_STARTED';
  dueDate: string = ''; // keep as ISO string from backend
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  priority: string;
  dueDate: Date;
  status: string;
}
