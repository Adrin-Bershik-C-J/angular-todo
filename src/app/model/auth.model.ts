export class RegisterModel {
  name: string = '';
  username: string = '';
  password: string = '';
}

export class LoginModel {
  username: string = '';
  password: string = '';
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface RegisterResponse {
  message: string;
}
