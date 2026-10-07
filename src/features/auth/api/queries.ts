import { useMutation, useQuery } from '@tanstack/react-query';
import { register, submitOnboarding, verifyEmail, login, resendVerification } from './service';
import {
  RegisterRequest,
  OnboardingRequest,
  LoginRequest,
  ResendVerificationRequest
} from './types';

export const authKeys = {
  all: ['auth'] as const,
  verifyEmail: (token: string) => [...authKeys.all, 'verifyEmail', token] as const
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data)
  });
};

export const useVerifyEmailQuery = (token: string) => {
  return useQuery({
    queryKey: authKeys.verifyEmail(token),
    queryFn: () => verifyEmail(token),
    enabled: !!token,
    retry: false // Don't retry verify email
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token)
  });
};

export const useOnboardingMutation = () => {
  return useMutation({
    mutationFn: (data: OnboardingRequest) => submitOnboarding(data)
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data)
  });
};

export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) => resendVerification(data)
  });
};
