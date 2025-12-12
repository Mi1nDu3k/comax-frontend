export interface User {
  id: number;
  username: string;
  avatar?:string;
  email: string;
  roleName: string; 
  isvip: boolean;
  isBanned: boolean;
}