export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  walletAmount: number;
}

export interface Ledger {
  id: number;
  userId: number;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  approvedAt?: string;
  user?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LedgerUploadRequest {
  amount: number;
  description: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}