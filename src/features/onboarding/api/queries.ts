// ============================================================
// Onboarding Queries — React Query Mutation Hooks
// ============================================================
// All onboarding steps are mutations (no data-fetching queries).
// Each hook wraps a server action from service.ts.
// ============================================================

import { useMutation } from '@tanstack/react-query';
import {
  createOnboarding,
  updateProfile,
  createBot,
  updateBot,
  getPaymentSettings,
  updatePaymentSettings
} from './service';
import type {
  CreateOnboardingRequest,
  UpdateProfileRequest,
  CreateBotRequest,
  UpdateBotRequest,
  UpdatePaymentRequest
} from './types';

export const onboardingKeys = {
  all: ['onboarding'] as const
};

export const paymentSettingsKeys = {
  all: ['payment-settings'] as const,
  detail: () => [...paymentSettingsKeys.all, 'detail'] as const
};

// ─── Step 1: Create Onboarding (first time) ─────────────────────────
export const useCreateOnboardingMutation = () => {
  return useMutation({
    mutationFn: (data: CreateOnboardingRequest) => createOnboarding(data)
  });
};

// ─── Step 1: Update Profile (back from Step 2) ──────────────────────
export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data)
  });
};

// ─── Step 2: Create Bot (first time) ────────────────────────────────
export const useCreateBotMutation = () => {
  return useMutation({
    mutationFn: (data: CreateBotRequest) => createBot(data)
  });
};

// ─── Step 2: Update Bot (already created) ───────────────────────────
export const useUpdateBotMutation = () => {
  return useMutation({
    mutationFn: ({ botId, data }: { botId: string; data: UpdateBotRequest }) =>
      updateBot(botId, data)
  });
};

// ─── Step 3: Update Payment Settings ────────────────────────────────
export const useUpdatePaymentMutation = () => {
  return useMutation({
    mutationFn: (data: UpdatePaymentRequest) => updatePaymentSettings(data)
  });
};

export const paymentSettingsQueryOptions = () => ({
  queryKey: paymentSettingsKeys.detail(),
  queryFn: getPaymentSettings,
  staleTime: 60_000
});
