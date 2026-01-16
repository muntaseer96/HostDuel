'use client';

import { cn } from '@/lib/utils';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function QuizProgress({ currentStep, totalSteps, className }: QuizProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">
          Question {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-accent">
          {Math.round(progress)}% complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              index < currentStep
                ? 'bg-accent'
                : index === currentStep
                ? 'bg-accent ring-4 ring-accent/20'
                : 'bg-bg-tertiary'
            )}
          />
        ))}
      </div>
    </div>
  );
}
