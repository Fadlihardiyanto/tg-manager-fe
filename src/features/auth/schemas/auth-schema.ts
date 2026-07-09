import { z } from 'zod';

export const tenantLoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter')
});

export type TenantLoginInput = z.infer<typeof tenantLoginSchema>;

export const tenantRegisterSchema = z
  .object({
    name: z.string().min(1, 'Nama lengkap wajib diisi'),
    email: z.string().email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(
        /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
        'Harus mengandung minimal satu angka atau simbol'
      )
      .regex(/[a-z]/, 'Harus mengandung huruf kecil')
      .regex(/[A-Z]/, 'Harus mengandung huruf besar'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak cocok',
    path: ['confirmPassword']
  });

export type TenantRegisterInput = z.infer<typeof tenantRegisterSchema>;

export const tenantOnboardingSchema = z.object({
  business_name: z.string().min(1, 'Nama bisnis wajib diisi'),
  business_slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda minus')
});

export type TenantOnboardingInput = z.infer<typeof tenantOnboardingSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid')
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
