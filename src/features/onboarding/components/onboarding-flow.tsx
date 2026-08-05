'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Stepper } from '@/components/reui/stepper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAppForm } from '@/components/ui/tanstack-form';
import { scrollToFirstError } from '@/components/ui/form-context';
import { useFormStepper } from '@/hooks/use-stepper';
import {
  useCreateOnboardingMutation,
  useUpdateProfileMutation,
  useCreateBotMutation,
  useUpdateBotMutation,
  useUpdatePaymentMutation
} from '../api/queries';
import { logout } from '@/features/auth/api/service';
import { useAuthStore } from '@/stores/auth-store';
import { ONBOARDING_STEPS } from '../constants';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  businessProfileSchema,
  telegramBotSchema,
  paymentGatewaySchema
} from '../schemas/onboarding';
import { BusinessProfileStep } from './steps/business-profile-step';
import { BotSetupStep } from './steps/bot-setup-step';
import { PaymentConfigStep } from './steps/payment-config-step';
import { ReviewStep } from './steps/review-step';
import { SuccessStep } from './steps/success-step';

const combinedSchema = z.object({
  businessName: businessProfileSchema.shape.businessName,
  businessSlug: businessProfileSchema.shape.businessSlug,
  category: businessProfileSchema.shape.category,
  botToken: z.string().optional(),
  midtransEnvironment: z.enum(['sandbox', 'production']).optional(),
  sandboxMerchantId: z.string().optional(),
  sandboxClientKey: z.string().optional(),
  sandboxServerKey: z.string().optional(),
  productionMerchantId: z.string().optional(),
  productionClientKey: z.string().optional(),
  productionServerKey: z.string().optional()
});

type OnboardingFormValues = z.infer<typeof combinedSchema>;

const STORAGE_KEY = 'tg-manager-onboarding-draft';

interface OnboardingDraftState {
  step: number;
  values: OnboardingFormValues;
  isStep1Submitted: boolean;
  createdBotId: string | null;
  botUsername: string | null;
}

const getDraft = (): OnboardingDraftState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const draft = sessionStorage.getItem(STORAGE_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
};

function OnboardingHeader({ currentStep }: { currentStep: number }) {
  const router = useRouter();

  return (
    <header className='fixed right-0 top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:w-[calc(100%-16rem)] md:px-8'>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium text-muted-foreground'>
          Langkah {currentStep} dari {ONBOARDING_STEPS.length}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='flex items-center gap-2'>
              <Avatar className='size-7'>
                <AvatarFallback className='text-xs'>AD</AvatarFallback>
              </Avatar>
              <span className='hidden text-sm font-medium md:inline-block'>
                admin@workspace.com
              </span>
              <Icons.chevronsDown className='hidden size-4 md:block' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='min-w-56 rounded-lg' align='end' sideOffset={4}>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='size-8'>
                  <AvatarFallback className='text-xs'>AD</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Admin</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    admin@workspace.com
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                useAuthStore.getState().clearAuth();
                router.push('/login');
              }}
            >
              <Icons.logout />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function OnboardingFlow() {
  const draft = useMemo(() => getDraft(), []);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isStep1Submitted, setIsStep1Submitted] = useState(() => draft?.isStep1Submitted ?? false);
  const [createdBotId, setCreatedBotId] = useState<string | null>(
    () => draft?.createdBotId ?? null
  );
  const [botUsername, setBotUsername] = useState<string | null>(() => draft?.botUsername ?? null);

  const createOnboarding = useCreateOnboardingMutation();
  const updateProfile = useUpdateProfileMutation();
  const createBotMut = useCreateBotMutation();
  const updateBotMut = useUpdateBotMutation();
  const updatePayment = useUpdatePaymentMutation();

  const isSubmitting =
    createOnboarding.isPending ||
    updateProfile.isPending ||
    createBotMut.isPending ||
    updateBotMut.isPending ||
    updatePayment.isPending;

  const { currentStep, step, handleCancelOrBack } = useFormStepper(
    [businessProfileSchema, telegramBotSchema, paymentGatewaySchema, z.object({})],
    draft?.step || 1
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const form = useAppForm({
    defaultValues:
      draft?.values ||
      ({
        businessName: '',
        businessSlug: '',
        category: '',
        botToken: '',
        midtransEnvironment: 'sandbox',
        sandboxMerchantId: '',
        sandboxClientKey: '',
        sandboxServerKey: '',
        productionMerchantId: '',
        productionClientKey: '',
        productionServerKey: ''
      } as OnboardingFormValues),
    onSubmit: async ({ value }) => {
      try {
        if (currentStep === 1) {
          if (!isStep1Submitted) {
            const res = await createOnboarding.mutateAsync({
              business_name: value.businessName,
              business_slug: value.businessSlug,
              category: value.category
            });
            if (res.success) {
              setIsStep1Submitted(true);
              toast.success('Workspace berhasil dibuat!');
              step.goToNextStep();
            } else {
              toast.error('Gagal membuat workspace', {
                description: res.message || 'Silakan coba lagi.'
              });
            }
          } else {
            const res = await updateProfile.mutateAsync({
              name: value.businessName,
              slug: value.businessSlug,
              category: value.category
            });
            if (res.success) {
              toast.success('Profil berhasil diperbarui!');
              step.goToNextStep();
            } else {
              toast.error('Gagal memperbarui profil', {
                description: res.message || 'Silakan coba lagi.'
              });
            }
          }
          return;
        }

        if (currentStep === 2) {
          if (!value.botToken?.trim()) {
            step.goToNextStep();
            return;
          }

          if (!createdBotId) {
            const res = await createBotMut.mutateAsync({
              token: value.botToken,
              bot_role: 'all_in_one'
            });
            if (res.success && res.data) {
              setCreatedBotId(res.data.id);
              setBotUsername(res.data.username || res.data.bot_username || null);
              toast.success('Bot berhasil terhubung!');
              step.goToNextStep();
            } else {
              toast.error('Gagal menghubungkan bot', {
                description: res.message || 'Token bot tidak valid atau terjadi error server.'
              });
            }
          } else {
            const res = await updateBotMut.mutateAsync({
              botId: createdBotId,
              data: { token: value.botToken }
            });
            if (res.success) {
              if (res.data) {
                setBotUsername(res.data.username || res.data.bot_username || null);
              }
              toast.success('Token bot berhasil diperbarui!');
              step.goToNextStep();
            } else {
              toast.error('Gagal memperbarui bot', {
                description: res.message || 'Silakan coba lagi.'
              });
            }
          }
          return;
        }

        if (currentStep === 3) {
          const isSandbox = value.midtransEnvironment === 'sandbox';
          const serverKey = isSandbox ? value.sandboxServerKey : value.productionServerKey;

          if (!serverKey?.trim()) {
            step.goToNextStep();
            return;
          }

          const res = await updatePayment.mutateAsync({
            is_sandbox: isSandbox,
            sandbox_merchant_id: isSandbox ? (value.sandboxMerchantId ?? '') : '',
            sandbox_server_key: isSandbox ? (value.sandboxServerKey ?? '') : '',
            sandbox_client_key: isSandbox ? (value.sandboxClientKey ?? '') : '',
            production_merchant_id: !isSandbox ? (value.productionMerchantId ?? '') : '',
            production_server_key: !isSandbox ? (value.productionServerKey ?? '') : '',
            production_client_key: !isSandbox ? (value.productionClientKey ?? '') : ''
          });

          if (res.success) {
            toast.success('Gateway pembayaran berhasil dikonfigurasi!');
            step.goToNextStep();
          } else {
            toast.error('Verifikasi pembayaran gagal', {
              description: res.message || 'Server key tidak valid atau terjadi error Midtrans.'
            });
          }
          return;
        }

        if (currentStep === 4) {
          sessionStorage.removeItem(STORAGE_KEY);
          setIsSuccess(true);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
        toast.error(message);
      }
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || isSuccess) return;

    const saveState = () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step: currentStep,
          values: form.state.values,
          isStep1Submitted,
          createdBotId,
          botUsername
        } as OnboardingDraftState)
      );
    };

    saveState();
    const unsub: any = form.store.subscribe(() => saveState());
    return () => {
      if (typeof unsub === 'function') unsub();
      else if (unsub && typeof unsub.unsubscribe === 'function') unsub.unsubscribe();
    };
  }, [currentStep, form, isSuccess, isStep1Submitted, createdBotId, botUsername]);

  if (isSuccess) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='w-full max-w-lg'>
          <SuccessStep />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-background text-foreground antialiased'>
      <aside className='fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border bg-card px-4 py-8 md:flex'>
        <div className='mb-10 flex items-center gap-2 px-1'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-primary'>
            <Icons.robot className='size-5 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-base font-bold text-primary'>Urator</h1>
            <p className='mt-[2px] text-xs text-muted-foreground'>Progres Onboarding</p>
          </div>
        </div>

        <Stepper
          steps={ONBOARDING_STEPS.map((s) => ({
            title: s.title,
            description: s.description,
            icon: (() => {
              const StepIcon = Icons[s.icon as keyof typeof Icons];
              return StepIcon ? <StepIcon className='size-4' /> : null;
            })()
          }))}
          currentStep={currentStep}
          orientation='vertical'
          onStepClick={(v) => step.goToStep(v)}
          completedIndicator={<CheckIcon className='size-3.5' />}
        />
      </aside>

      <main className='ml-0 flex flex-1 flex-col md:ml-64'>
        <OnboardingHeader currentStep={currentStep} />

        <div className='flex md:hidden items-center gap-2 border-b border-border bg-muted/20 px-4 py-2'>
          <div className='flex flex-1 gap-1'>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  s <= currentStep ? 'bg-primary' : 'bg-border'
                )}
              />
            ))}
          </div>
          <span className='shrink-0 text-xs text-muted-foreground'>Langkah {currentStep}/4</span>
        </div>

        <div ref={scrollRef} className='mt-16 flex-1 overflow-y-auto md:mt-16'>
          <div className='mx-auto flex w-full max-w-[760px] flex-col px-4 pt-10 pb-10 md:px-8'>
            <form.AppForm>
              <form.Form id='onboarding-form' className='mx-0 gap-0 p-0'>
                {currentStep === 1 && <BusinessProfileStep form={form} />}
                {currentStep === 2 && <BotSetupStep form={form} />}
                {currentStep === 3 && <PaymentConfigStep form={form} />}
                {currentStep === 4 && (
                  <ReviewStep
                    form={form}
                    onBack={() => handleCancelOrBack()}
                    botUsername={botUsername}
                  />
                )}
              </form.Form>

              {currentStep < 4 && (
                <div className='sticky bottom-0 z-10 -mx-4 mt-12 flex items-center justify-between border-t border-border bg-background/90 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8'>
                  {currentStep > 1 ? (
                    <Button type='button' variant='outline' onClick={() => handleCancelOrBack()}>
                      <Icons.arrowLeft />
                      Kembali
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className='flex items-center gap-3'>
                    {currentStep > 1 && currentStep < 4 && (
                      <Button type='button' variant='outline' onClick={() => step.goToNextStep()}>
                        Skip
                      </Button>
                    )}

                    <Button
                      type='button'
                      size='lg'
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                        scrollToFirstError();
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Icons.spinner className='mr-2 size-4 animate-spin' />
                          Processing...
                        </>
                      ) : currentStep === 4 ? (
                        <>
                          Finish Setup
                          <Icons.check />
                        </>
                      ) : (
                        <>
                          Save and continue
                          <Icons.arrowRight />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form.AppForm>
          </div>
        </div>
      </main>
    </div>
  );
}
