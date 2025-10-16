import axios from 'axios';
import type { AuthResponse, LoginRequest, User, Ledger, LedgerCreateRequest, CreateUserRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/user/create', data);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/user/all');
    return response.data;
  },
};

export const ledgerService = {
  createLedger: async (data: LedgerCreateRequest): Promise<{ message: string; ledgerId: number }> => {
    const formData = new FormData();
    formData.append('amount', data.amount.toString());
    formData.append('description', data.description);
    if (data.file) {
      formData.append('file', data.file);
    }
    const response = await api.post('/ledger/create', formData);
    return response.data;
  },

  getMyLedgers: async (): Promise<Ledger[]> => {
    const response = await api.get('/ledger/my-ledgers');
    return response.data;
  },

  getPendingLedgers: async (): Promise<Ledger[]> => {
    const response = await api.get('/ledger/pending');
    return response.data;
  },

  approveLedger: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/ledger/approve/${id}`);
    return response.data;
  },

  rejectLedger: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/ledger/reject/${id}`);
    return response.data;
  },

  deleteLedger: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/ledger/${id}`);
    return response.data;
  },

  updateLedger: async (id: number, data: LedgerCreateRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('amount', data.amount.toString());
    formData.append('description', data.description);
    if (data.file) {
      formData.append('file', data.file);
    }
    const response = await api.put(`/ledger/${id}`, formData);
    return response.data;
  },

  downloadFile: async (id: number): Promise<Blob> => {
    const response = await api.get(`/ledger/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const adminService = {
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<CreateUserRequest>): Promise<{ message: string }> => {
    const response = await api.put(`/user/${id}`, data);
    return response.data;
  },
};