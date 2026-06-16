export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  userName: string;
  email: string;
  token: string;
}
