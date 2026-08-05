'use client';

import { useStore } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  createFormField
} from '@/components/ui/form-context';

interface DateTimeFieldProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'onBlur' | 'type'
> {
  label: string;
  description?: string;
  required?: boolean;
  min?: string;
  max?: string;
  hideError?: boolean;
}

const toDisplay = (value: string) => value.replace(' ', 'T');
const toStore = (value: string) => value.replace('T', ' ');

export function DateTimeField({
  label,
  description,
  required,
  hideError,
  min,
  max,
  className,
  ...inputProps
}: DateTimeFieldProps) {
  const field = useFieldContext();
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const isValid = useStore(field.store, (s) => s.meta.isValid);
  const value = useStore(field.store, (s) => s.value) as string;

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && ' *'}
        </FieldLabel>
        <Input
          id={field.name}
          type='datetime-local'
          value={value ? toDisplay(value) : ''}
          min={min}
          max={max}
          onBlur={field.handleBlur}
          onChange={(e) => {
            let val = e.target.value;
            if (val && min && val < min) val = min;
            if (val && max && val > max) val = max;
            field.handleChange(val ? toStore(val) : '');
          }}
          aria-invalid={isTouched && !isValid}
          className={className}
          {...inputProps}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FormField>
      {!hideError && (
        <div className='relative h-4'>
          <div className='absolute left-0 top-0'>
            <FormFieldError />
          </div>
        </div>
      )}
    </FormFieldSet>
  );
}

export const FormDateTimeField = createFormField(DateTimeField);
