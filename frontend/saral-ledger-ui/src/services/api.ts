import axios from 'axios';
import type { AuthResponse, LoginRequest, User, Ledger, LedgerUploadRequest, CreateUserRequest } from '../types';

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
  uploadLedger: async (data: LedgerUploadRequest): Promise<{ message: string; ledgerId: number }> => {
    const response = await api.post('/ledger/upload', data);
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
};