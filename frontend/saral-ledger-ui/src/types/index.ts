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
  fileName?: string;
  contentType?: string;
  rejectionReason?: string;
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

export interface LedgerCreateRequest {
  amount: number;
  description: string;
  file?: File;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}