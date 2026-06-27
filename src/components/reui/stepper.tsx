import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  orientation?: 'vertical' | 'horizontal';
  onStepClick?: (step: number) => void;
  completedIndicator?: React.ReactNode;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'vertical',
  onStepClick,
  completedIndicator,
  className
}: StepperProps) {
  return (
    <nav data-slot='stepper' className={cn(orientation === 'horizontal' ? 'flex-row' : '', className)}>
      <ul className={cn('flex', orientation === 'vertical' ? 'flex-col' : 'flex-row items-center')}>
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const state = stepNum < currentStep ? 'completed' : stepNum === currentStep ? 'active' : 'inactive';
          const isLast = i === steps.length - 1;

          return (
            <li key={stepNum} data-state={state} className='group/step flex relative items-start'>
              <button
                type='button'
                disabled={state !== 'completed'}
                onClick={() => { if (state === 'completed') onStepClick?.(stepNum); }}
                className='flex items-start gap-3 pb-5 last:pb-0 cursor-default disabled:cursor-default'
              >
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all',
                    state === 'completed' && 'bg-emerald-500 text-white',
                    state === 'active' && 'border-2 border-primary bg-background text-primary ring-4 ring-primary/10',
                    state === 'inactive' && 'border-2 border-border bg-background text-muted-foreground'
                  )}
                >
                  {state === 'completed' && completedIndicator ? completedIndicator : step.icon ?? stepNum}
                </div>
                <div className='mt-0.5 flex flex-col gap-0.5 text-left'>
                  <span className='text-sm font-medium'>{step.title}</span>
                  <span className='text-xs text-muted-foreground'>{step.description}</span>
                </div>
              </button>
              {!isLast && (
                <div className='absolute left-4 top-8 bottom-2 w-px border-l border-dashed border-border group-data-[state=completed]/step:border-solid group-data-[state=completed]/step:bg-emerald-500 group-data-[state=completed]/step:border-emerald-500' />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
