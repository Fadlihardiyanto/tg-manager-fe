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
import { Spinner } from '@/components/ui/spinner';

interface TextFieldProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'onBlur'
> {
  label: string;
  description?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  /** Icon rendered on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Element rendered on the right side of the input (e.g. check icon, toggle button) */
  rightElement?: React.ReactNode;
  /** Hide the inline field error message (use when validation is shown elsewhere) */
  hideError?: boolean;
  /** Transform stored value for display (e.g. add thousand separators) */
  formatDisplay?: (value: string | number) => string;
  /** Strip unwanted characters from input (runs before formatDisplay) */
  sanitize?: (value: string) => string;
}

export function TextField({
  label,
  description,
  required,
  type = 'text',
  className,
  leftIcon,
  rightElement,
  hideError,
  formatDisplay,
  sanitize,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext();
  const isTouched = useStore(field.store, (s) => s.meta.isTouched);
  const isValid = useStore(field.store, (s) => s.meta.isValid);
  const isValidating = useStore(field.store, (s) => s.meta.isValidating);
  const value = useStore(field.store, (s) => s.value) as string | number;

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && ' *'}
        </FieldLabel>
        <div className='relative group'>
          {leftIcon && (
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground transition-colors group-focus-within:text-primary'>
              {leftIcon}
            </div>
          )}
          <Input
            id={field.name}
            type={type}
            value={formatDisplay ? formatDisplay(value ?? '') : (value ?? '')}
            onBlur={field.handleBlur}
            onChange={(e) => {
              const val = sanitize ? sanitize(e.target.value) : e.target.value;
              if (formatDisplay) {
                const cleaned = val.replace(/\D/g, '');
                field.handleChange(cleaned);
              } else if (type === 'number') {
                field.handleChange(val === '' ? '' : parseFloat(val));
              } else {
                field.handleChange(val);
              }
            }}
            aria-invalid={isTouched && !isValid}
            className={className}
            {...inputProps}
          />
          {rightElement && (
            <div className='absolute inset-y-0 right-0 flex items-center pr-3'>{rightElement}</div>
          )}
          {isValidating && !rightElement && (
            <div className='absolute top-1/2 right-3 -translate-y-1/2'>
              <Spinner className='h-4 w-4' />
            </div>
          )}
        </div>
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

export const FormTextField = createFormField(TextField);
