import { axiosInstance } from '@/lib/axios';
import type { LoginForm, LoginResponse } from '@/types';

export const authApi = {
  login: async (credentials: LoginForm): Promise<LoginResponse> => {
    // DummyJSON Login Endpoint requires username and password
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
