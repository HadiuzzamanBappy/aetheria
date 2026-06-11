import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string().optional(),
  image: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginResponseSchema = UserSchema.extend({
  token: z.string(),
  refreshToken: z.string().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const LoginFormSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;
