import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface EncryptionRequest {
  data: string;
  algorithm: string;
  key_id?: string;
}

export interface DecryptionRequest {
  encrypted_data: string;
  algorithm: string;
  key_id?: string;
}

export interface EncryptionResponse {
  encrypted_data: string;
  algorithm: string;
  key_id?: string;
  timestamp: string;
  status: string;
  input_hash: string;
  output_hash: string;
  metadata?: Record<string, any>;
}

export interface DecryptionResponse {
  decrypted_data: string;
  algorithm: string;
  key_id?: string;
  timestamp: string;
  status: string;
  input_hash: string;
  output_hash: string;
}

export interface Algorithm {
  name: string;
  value: string;
  type: string;
  description?: string;
  key_sizes?: number[];
}

export const encryptionAPI = {
  // Get available encryption algorithms
  async getAlgorithms(): Promise<{ algorithms: Algorithm[] }> {
    try {
      const response = await api.get('/api/v1/algorithms');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch algorithms');
    }
  },

  // Encrypt data
  async encrypt(request: EncryptionRequest): Promise<EncryptionResponse> {
    try {
      const response = await api.post('/api/v1/encrypt', request);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Encryption failed');
    }
  },

  // Decrypt data
  async decrypt(request: DecryptionRequest): Promise<DecryptionResponse> {
    try {
      const response = await api.post('/api/v1/decrypt', request);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Decryption failed');
    }
  },

  // Get encryption history
  async getHistory(): Promise<EncryptionResponse[]> {
    try {
      const response = await api.get('/api/v1/history');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch encryption history');
    }
  },

  // Get encryption statistics
  async getStats(): Promise<{
    total_operations: number;
    algorithms_used: Record<string, number>;
    recent_activity: Array<{
      date: string;
      count: number;
    }>;
  }> {
    try {
      const response = await api.get('/api/v1/stats');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch encryption statistics');
    }
  },
};
