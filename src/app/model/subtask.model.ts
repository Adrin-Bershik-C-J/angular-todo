export class SubTask {
  name: string = '';
  description: string = '';
  dueDate: string = '';
  projectId: number = 0;
  tlId: number = 0;
  memberId: number = 0;
}

export interface SubtaskResponse {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
  projectId: number;
  tlUsername: string;
  memberUsername: string;
}
