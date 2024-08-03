export interface IUser {
  id: string;
  email: string;
  avatarUrl: string;
  name: string;
}

export interface IUserSession {
  user: IUser | null;
  isAuthenticated: boolean;
}
