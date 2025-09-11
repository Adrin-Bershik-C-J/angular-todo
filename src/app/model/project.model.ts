export class ProjectRequestModel {
  name: string = '';
  description: string = '';
  dueDate: string = '';
  tlUsername: string = '';
  memberUsernames: string[] = [];
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
