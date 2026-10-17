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
  role?: 'admin' | 'curator' | 'student';
  subscriptionPlan?: 'free' | 'pro' | 'premium';
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';
  subscriptionExpiresAt?: string;
  createdAt: string;
  targetExamName?: string;
  targetExamDate?: string;
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
  targetExamName?: string;
  targetExamDate?: string;
}
