import { z } from 'zod';

// Step 1: Business Profile
export const businessProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Nama bisnis harus minimal 2 karakter')
    .max(100, 'Nama bisnis harus maksimal 100 karakter'),
  businessSlug: z
    .string()
    .min(3, 'Slug harus minimal 3 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung'),
  category: z.string().min(1, 'Silakan pilih kategori komunitas')
});

export type BusinessProfileValues = z.infer<typeof businessProfileSchema>;

// Step 2: Telegram Bot (optional — can be skipped)
export const telegramBotSchema = z.object({
  botToken: z
    .string()
    .min(1, 'Token bot wajib diisi')
    .regex(
      /^\d+:[A-Za-z0-9_-]{35,}$/,
      'Format token bot tidak valid (mis. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)'
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

export const requiredKeySchema = z.string().min(1, 'Kolom ini wajib diisi');

export type PaymentGatewayValues = z.infer<typeof paymentGatewaySchema>;

// Combined onboarding data
export interface OnboardingData {
  businessProfile: BusinessProfileValues;
  telegramBot: TelegramBotValues | null;
  paymentGateway: PaymentGatewayValues | null;
}
