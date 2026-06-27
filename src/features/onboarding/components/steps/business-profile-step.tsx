import { Icons } from '@/components/icons';
import { Heading } from '@/components/ui/heading';
import { useFormFields } from '@/components/ui/tanstack-form';
import { businessProfileSchema } from '../../schemas/onboarding';
import { COMMUNITY_CATEGORIES } from '../../constants';

interface StepProps {
  form: any;
}

export function BusinessProfileStep({ form }: StepProps) {
  const { FormTextField, FormSelectField } =
    useFormFields<any>();

  return (
    <div className='flex flex-col gap-8'>
      <Heading
        title='Create Your Workspace'
        description='Set up your business profile to get started with TG-Manager.'
      />

      <div className='flex flex-col gap-5'>
        <h4 className='text-lg font-semibold'>Business Details</h4>

        <FormTextField
          name='businessName'
          label='Business / Community Name'
          required
          placeholder='e.g. Crypto VIP Signal'
          validators={{
            onChange: businessProfileSchema.shape.businessName
          }}
          listeners={{
            onChange: ({ value, fieldApi }: any) => {
              const strValue = value as string;
              if (strValue) {
                fieldApi.form.setFieldValue(
                  'businessSlug',
                  strValue
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
                );
              }
            }
          }}
        />

        <FormTextField
          name='businessSlug'
          label='URL Slug'
          required
          placeholder='crypto-vip-signal'
          className='pl-[68px]'
          leftIcon={
            <span className='text-sm text-muted-foreground select-none'>
              tg.app/
            </span>
          }
          validators={{
            onChange: businessProfileSchema.shape.businessSlug
          }}
          listeners={{
            onChange: ({ value, fieldApi }: any) => {
              const strValue = value as string;
              if (strValue) {
                const formatted = strValue
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '');
                if (strValue !== formatted) {
                  fieldApi.setValue(formatted);
                }
              }
            }
          }}
          description="This will be your community's unique link"
        />

        <FormSelectField
          name='category'
          label='Community Category'
          required
          validators={{
            onChange: businessProfileSchema.shape.category
          }}
          options={
            COMMUNITY_CATEGORIES as unknown as {
              value: string;
              label: string;
            }[]
          }
        />
      </div>
    </div>
  );
}
