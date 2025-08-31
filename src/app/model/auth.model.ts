export class RegisterModel {
  name: string;
  username: string;
  password: string;

  constructor() {
    this.name = '';
    this.username = '';
    this.password = '';
  }
}

export class LoginModel {
  username: string;
  password: string;

  constructor() {
    this.username = '';
    this.password = '';
  }
}
