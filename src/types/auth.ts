export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  id?: string;
  email?: string;
  name?: string;
  message?: string;
}