import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginForm, LoginResponse } from '@/types';

export const useLoginMutation = (options?: {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const loginToStore = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginForm) => authApi.login(credentials),
    onSuccess: (data) => {
      loginToStore(
        {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          image: data.image,
        },
        data.token,
        data.refreshToken
      );
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
