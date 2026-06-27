import { z } from 'zod';

export const tenantLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type TenantLoginInput = z.infer<typeof tenantLoginSchema>;

export const tenantRegisterSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, 'Must contain at least one number or symbol')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type TenantRegisterInput = z.infer<typeof tenantRegisterSchema>;

export const tenantOnboardingSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only')
});

export type TenantOnboardingInput = z.infer<typeof tenantOnboardingSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
