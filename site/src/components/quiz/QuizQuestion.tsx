'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuizOption<T> {
  value: T;
  label: string;
  description: string;
  icon?: string;
}

interface QuizQuestionProps<T> {
  question: string;
  subtitle?: string;
  options: QuizOption<T>[];
  selectedValue: T | T[] | null;
  multiSelect?: boolean;
  onSelect: (value: T) => void;
  className?: string;
}

export function QuizQuestion<T extends string>({
  question,
  subtitle,
  options,
  selectedValue,
  multiSelect = false,
  onSelect,
  className,
}: QuizQuestionProps<T>) {
  const isSelected = (value: T) => {
    if (multiSelect && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Question header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {question}
        </h2>
        {subtitle && (
          <p className="text-text-secondary">{subtitle}</p>
        )}
      </div>

      {/* Options grid */}
      <div className="grid gap-3">
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'group relative w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200',
                'hover:border-accent/50 hover:bg-bg-elevated/50',
                'focus:outline-none focus:ring-2 focus:ring-accent/50',
                selected
                  ? 'border-accent bg-accent/10'
                  : 'border-border-subtle bg-bg-secondary'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox/Radio indicator */}
                <div
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    selected
                      ? 'border-accent bg-accent'
                      : 'border-border-medium group-hover:border-accent/50'
                  )}
                >
                  {selected && (
                    <Check className="w-4 h-4 text-background" />
                  )}
                </div>

                {/* Option content */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-lg">
                    {option.label}
                  </div>
                  <div className="text-sm text-text-secondary mt-0.5">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Multi-select hint */}
      {multiSelect && (
        <p className="text-center text-sm text-text-muted mt-4">
          Select all that apply, then click Next
        </p>
      )}
    </div>
  );
}
