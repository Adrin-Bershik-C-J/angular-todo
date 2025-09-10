export class ProjectRequestModel {
  name: string = '';
  description: string = '';
  dueDate: string = '';
  tlId: number = 0;
  memberIds: number[] = [];
}

export interface ProjectResponseModel {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  managerUsername: string;
  tlUsername: string;
  memberUsernames: string[];
}
