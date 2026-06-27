import { z } from 'zod';

// Step 1: Business Profile
export const businessProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be at most 100 characters'),
  businessSlug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  category: z.string().min(1, 'Please select a community category')
});

export type BusinessProfileValues = z.infer<typeof businessProfileSchema>;

// Step 2: Telegram Bot (optional — can be skipped)
export const telegramBotSchema = z.object({
  botToken: z
    .string()
    .min(1, 'Bot token is required')
    .regex(
      /^\d+:[A-Za-z0-9_-]{35,}$/,
      'Invalid bot token format (e.g., 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)'
    )
});

export type TelegramBotValues = z.infer<typeof telegramBotSchema>;

// Step 3: Payment Gateway (optional — can be skipped)
export const paymentGatewaySchema = z.object({
  midtransEnvironment: z.enum(['sandbox', 'production']).default('sandbox'),
  sandboxMerchantId: z.string().optional(),
  sandboxClientKey: z.string().optional(),
  sandboxServerKey: z.string().optional(),
  productionMerchantId: z.string().optional(),
  productionClientKey: z.string().optional(),
  productionServerKey: z.string().optional()
});

export const requiredKeySchema = z.string().min(1, 'This field is required');

export type PaymentGatewayValues = z.infer<typeof paymentGatewaySchema>;

// Combined onboarding data
export interface OnboardingData {
  businessProfile: BusinessProfileValues;
  telegramBot: TelegramBotValues | null;
  paymentGateway: PaymentGatewayValues | null;
}
