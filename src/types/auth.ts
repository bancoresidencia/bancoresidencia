export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  specialtyTarget?: string;
  college?: string;
  graduationYear?: number;
  dailyGoal: number;
  phone?: string;
  state?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  specialtyTarget?: string;
  college?: string;
  graduationYear?: number;
  dailyGoal?: number;
  phone?: string;
  state?: string;
}
