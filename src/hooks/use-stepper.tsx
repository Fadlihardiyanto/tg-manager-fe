import type { AnyFormApi } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import type { ZodTypeAny } from 'zod';

/**
 * Options for handling cancel/back actions
 */
type HandleCancelOrBackOpts = {
  onBack?: VoidFunction;
  onCancel?: VoidFunction;
};

/**
 * State of the current step
 */
type StepState = {
  value: number;
  count: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (step: number) => void;
  isCompleted: boolean;
};

/**
 * Hook for managing multi-step form navigation and validation
 *
 * @param schemas - Array of Zod schemas for each step
 * @returns Object with stepper state and methods
 */
export function useFormStepper(schemas: ZodTypeAny[], initialStep: number = 1) {
  const stepCount = schemas.length;
  const [currentStep, setCurrentStep] = useState(initialStep); // Start from initialStep

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, stepCount));
  }, [stepCount]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((target: number) => {
    // Only allow navigating to completed steps (before current) or current step
    setCurrentStep((prev) => {
      if (target >= 1 && target <= prev) return target;
      return prev;
    });
  }, []);

  const step: StepState = {
    value: currentStep,
    count: stepCount,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isCompleted: currentStep === stepCount
  };

  const currentValidator = schemas[currentStep - 1]; // Convert to 0-based for array access
  const isFirstStep = currentStep === 1;

  const triggerFormGroup = (form: AnyFormApi) => {
    const result = currentValidator.safeParse(form.state.values);
    if (!result.success) {
      result.error.issues.forEach((err) => {
        const fieldName = err.path.join('.');
        if (fieldName) {
          form.setFieldMeta(fieldName as any, (prev) => ({
            ...prev,
            isTouched: true,
            errors: [err.message]
          }));
        }
      });
      return result;
    }

    return result;
  };

  const handleNextStepOrSubmit = async (form: AnyFormApi) => {
    const result = triggerFormGroup(form);
    if (!result.success) {
      return;
    }

    if (currentStep < stepCount) {
      goToNextStep();
      return;
    }

    // Only trigger actual form submission on the last step when all step validations pass
    if (currentStep === stepCount) {
      await form.handleSubmit();
    }
  };

  const handleCancelOrBack = (opts?: HandleCancelOrBackOpts) => {
    if (isFirstStep) {
      opts?.onCancel?.();
      return;
    }

    opts?.onBack?.();
    goToPrevStep();
  };

  return {
    step, // Current step state
    currentStep, // Current step number (1-based)
    isFirstStep, // Whether current step is the first step
    currentValidator, // Zod schema for current step
    triggerFormGroup, // Validate current step fields
    handleNextStepOrSubmit, // Handle next/submit action
    handleCancelOrBack // Handle back/cancel action
  };
}
