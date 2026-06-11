export interface AuthBody {
  email: string;
  password: string;
}

export interface MeResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}
