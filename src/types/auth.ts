import { User } from "./user";
export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  user: User;
 
}